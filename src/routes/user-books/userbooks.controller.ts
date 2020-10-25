import { Book } from "../../models/book"
import { PoolConnection } from "mysql"
import myPool from "../../helpers/mysql.pool"
import {UserBook} from '../../models/userbook'
import {BooksController} from "../books/books.controller"

export class UserBooksController {
    public async searchUserBooks(isbn: string, 
        geolocation?: [number, number], 
        distance?: number,
        status?: string,
        lending?: number, 
        selling?: number,  
        limit: number = 25, 
        page: number = 1): Promise<UserBook[]>{

        return new Promise<UserBook[]>((resolve, reject) => {
            let query = 
            `select * from user_book 
            inner join book on user_book.book_id=book.id 
            where ${isbn.length === 13 ? `isbn13`:`isbn`} = ? 
            ${status ? `and status = ? `:``}
            ${lending != undefined ? `and lending = ? `:``}
            ${selling != undefined? `and selling = ? `:``}
            ${geolocation && distance != undefined ? `and ST_Distance(Point(?, ?), geolocation) <= ? `:``}
            limit ?
            offset ?; 
            select name from author 
            inner join book_author on book_author.author_id = author.id 
            inner join book on book_author.book_id = book.id
            where ${isbn.length === 13 ? `book.isbn13`:`book.isbn`} = ?;`

            let v = []
            v.push(isbn)
            if(status) v.push(status)
            if(lending != undefined) v.push(lending)
            if(selling != undefined) v.push(selling)
            if(geolocation && distance != undefined){
                v.push(geolocation[0])
                v.push(geolocation[1])
                v.push(distance)
            }
            v.push(limit)
            v.push(limit*(page-1))
            v.push(isbn)

            myPool.query({
                sql: query,
                values: v
                } , (error, results: Array<Array<any>>) => {
                if(error){
                    reject(error)
                } else {
                    const authors = results[1].map<string>((value) => {
                        return `${value['name']}`
                    })
                    const userBooks: UserBook[] = results[0].map<UserBook>((value): UserBook => {
                        return new UserBook(
                            value['id'],
                            value['user_id'],
                            value['book_id'], 
                            value['title'], 
                            authors, //List of authors
                            value['isbn'],
                            value['isbn13'], 
                            value['release_date'], 
                            value['edition'], 
                            value['image_url'], 
                            value['status'], 
                            value['selling'], 
                            value['lending'], 
                            [value['geolocation'].x, value['geolocation'].y])
                    })
    
                    resolve(userBooks)
                }
            })
        })
    }

    public async getLibraryOfUser(userId: string, limit: number = 25, page: number = 1): Promise<UserBook[]> {
        return new Promise<UserBook[]>((resolve, reject) => {
            let query = `select * from user_book 
            inner join book on user_book.book_id=book.id 
            where user_book.user_id = ? 
            limit ? 
            offset ?; 
            select name from author 
            inner join book_author on book_author.author_id = author.id;`

            myPool.query({
                sql: query,
                values: [userId, limit, limit*(page-1)]
                } , (error, results: Array<Array<any>>) => {
                if(error){
                    reject(error)
                } else {
                    const authors = results[1].map<string>((value) => {
                        return `${value['name']}`
                    })
                    const userBooks: UserBook[] = results[0].map<UserBook>((value): UserBook => {
                        return new UserBook(
                            value['id'],
                            value['user_id'],
                            value['book_id'], 
                            value['title'], 
                            authors, //List of authors
                            value['isbn'], 
                            value['isbn13'], 
                            value['release_date'], 
                            value['edition'], 
                            value['image_url'], 
                            value['status'], 
                            value['selling'], 
                            value['lending'], 
                            [value['geolocation'].y, value['geolocation'].x])
                    })
    
                    resolve(userBooks)
                }
            })
        })
    }

    public async addBookToLibrary(userId: string, 
        status: string,
        lending: number,
        selling: number,
        geolocation: [number, number], 
        isbn13: string): Promise<string> {

        const bookController = new BooksController()
        return new Promise<any>((resolve, reject) => { //Gets book from DB, if present. Otherwise, gets book from external API.
            let getBookQuery = `select * from book where isbn13 = ? and id not in (select book_id from custom_book);`
            myPool.query({
                sql: getBookQuery,
                values:[isbn13]
            }, (error, results) => {
                if(error){
                    reject(error)
                } else {
                    if(results.length == 0){
                        bookController.getBookByISBN(isbn13)
                        .then((book) => {
                            if(!book){
                                reject(`Book with ISBN number ${isbn13} not found`)
                            } else {
                                resolve({
                                    book,
                                    newEntry: true
                                })
                            }
                        }).catch((error) => {
                            reject(error)
                        })
                    } else {
                        resolve({
                            bookId: results[0]['id'],
                            newEntry: false
                        })
                    }
                }
            })
        }).then(async (bookDetails) => {
            return new Promise<any>((resolve, reject) => {
                myPool.getConnection((error, connection) => {
                    if(error) {
                        reject(error)
                    } else {
                        resolve({
                            bookDetails,
                            connection
                        })
                    }
                })
            })
        }).then(async (value) => {
            let connection: PoolConnection = value.connection
            return new Promise<any>((resolve, reject) => {
                connection.beginTransaction((error) => {
                    if(error){
                        reject(error)
                    } else {
                        resolve(value)
                    }
                })
            })
        }).then(async (value) => {
            let connection: PoolConnection = value.connection
            let bookDetails: any = value.bookDetails
            let bookId = bookDetails.bookId
            if(bookDetails.newEntry){
                try{
                    let book: Book = bookDetails.book
                    bookId = await bookController.insertBook(book, connection)
                    for(let i = 0; i < book.authors.length; i++){
                        let name = book.authors[i]
                        let authorId = await bookController.insertAuthor(name, connection)
                        await bookController.addAuthorToBook(authorId, bookId, connection)
                    }
                } catch(error){
                    connection.rollback((error) => {
                        if(error){
                            console.log(error)
                        }
                    })
                    throw new Error(error.message)
                }
            }

            return new Promise<any>((resolve, reject) => {
                let insertUserBookQuery = `set @userBookId = uuid_to_bin(uuid()); 
                insert into user_book (id, user_id, book_id, status, lending, selling, geolocation) values(@userBookId, ?, ?, ?, ?, ?, ST_GeomFromText('Point(? ?)')); 
                select @userBookId;`
                connection.query({
                    sql: insertUserBookQuery,
                    values: [ userId, bookId, status, lending, selling, geolocation[0], geolocation[1]]
                }, (error, results) => {
                    if(error){
                        connection.rollback(() => {
                            reject(error)
                        })
                    } else {
                        connection.commit((error) => {
                            if(error) {
                                connection.rollback(() => {
                                    reject(error)
                                })
                            } else {
                                resolve(results[2][0]['@userBookId'])
                            }
                        })
                    }
                })
            })
        })
    }

    public async addCustomBookToLibrary(book: Book, userId: string, status: string, lending: number, selling: number, geolocation: [number, number]): Promise<string>{
        const bookController = new BooksController()

        return new Promise<PoolConnection>((resolve, reject) => {
            myPool.getConnection((error, connection) => {
                if(error) {
                    reject(error)
                } else {
                    resolve(connection)
                }
            })
        }).then(async (connection) => {
            return new Promise<PoolConnection>((resolve, reject) => {
                connection.beginTransaction((error) => {
                    if(error){
                        reject(error)
                    } else {
                        resolve(connection)
                    }
                })
            })
        }).then(async (connection) => {
            try{
                let bookId = await bookController.insertBook(book, connection)
                for(let i = 0; i < book.authors.length; i++){
                    let name = book.authors[i]
                    let authorId = await bookController.insertAuthor(name, connection)
                    await bookController.addAuthorToBook(authorId, bookId, connection)
                }

                return new Promise<any>((resolve, reject) => {
                    let customBookQuery = `insert into custom_book (book_id, user_id) values (?, ?);`
                    connection.query({
                        sql: customBookQuery,
                        values: [bookId, userId]
                    }, (error) => {
                        if(error){
                            connection.rollback(() => {
                                reject(error)
                            })
                        } else {
                            resolve({
                                connection,
                                bookId
                            })
                        }
                    })
                })
            } catch(error){
                connection.rollback((error) => {
                    if(error){
                        console.log(error)
                    }
                })
                throw new Error(error.message)
            }
        }).then(async (value) => {
            let connection: PoolConnection = value.connection
            let bookId: string = value.bookId
            return new Promise<any>((resolve, reject) => {
                let insertUserBookQuery = `set @userBookId = uuid_to_bin(uuid()); 
                insert into user_book (id, user_id, book_id, status, lending, selling, geolocation) values(@userBookId, ?, ?, ?, ?, ?, ST_GeomFromText('Point(? ?)')); 
                select @userBookId;`
                connection.query({
                    sql: insertUserBookQuery,
                    values: [ userId, bookId, status, lending, selling, geolocation[0], geolocation[1]]
                }, (error, results) => {
                    if(error){
                        connection.rollback(() => {
                            reject(error)
                        })
                    } else {
                        connection.commit((error) => {
                            if(error) {
                                connection.rollback(() => {
                                    reject(error)
                                })
                            } else {
                                resolve(results[2][0]['@userBookId'])
                            }
                        })
                    }
                })
            })
        })
    }
}