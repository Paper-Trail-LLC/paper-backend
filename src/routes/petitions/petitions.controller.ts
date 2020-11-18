import { BookPetition } from "../../models/petition";
import myPool from "../../helpers/mysql.pool"
import { BooksController } from "../books/books.controller";
import { PoolConnection } from "mysql";

export class PetitionsController {

    public async searchPetitions(expired: boolean, isbn?: string, status?: string, lending?: number, selling?: number, currentLocation?: [number, number], searchRadius?: number, page: number = 1, limit: number = 25): Promise<BookPetition[]> {
        return new Promise<BookPetition[]>((resolve, reject) => {
            const query = `select *, bin_to_uuid(book_petition.id) as full_id, bin_to_uuid(book_id) as full_book_id, bin_to_uuid(user_id) as full_user_id 
            from book_petition inner join book on book_petition.book_id = book.id 
            where expiration_date ${expired? '<':'>'} now() 
            ${isbn? 'and (isbn = ? or isbn13 = ?) ':''}
            ${status? 'and status = ? ':''}
            ${lending != undefined? 'and lending = ? ':''}
            ${selling != undefined? 'and selling = ? ':''}
            ${currentLocation? 'and ST_Distance(Point(?, ?), geolocation) <= ? and (location_radius is null or ST_Distance(Point(?, ?), geolocation) <= location_radius) ':''}
            limit ? 
            offset ?;`

            const v = []
            if(isbn) v.push(isbn)
            if(status) v.push(status)
            if(lending != undefined) v.push(lending)
            if(selling != undefined) v.push(selling)
            if(currentLocation) {
                v.push(currentLocation[0])
                v.push(currentLocation[1])
                v.push(searchRadius)
                v.push(currentLocation[0])
                v.push(currentLocation[1])
            }
            v.push(limit)
            v.push(limit*(page-1))

            myPool.query({
                sql: query,
                values: v
            }, (error, results: Array<any>) => {
                if(error){
                    reject(error)
                } else {
                    const bookPetitions: BookPetition[] = results.map<BookPetition>((value) => {
                        return new BookPetition(
                            value['full_book_id'],
                            value['full_user_id'],
                            value['description'],
                            value['lending'],
                            value['selling'],
                            value['status'], 
                            [value['geolocation'].x, value['geolocation'].y],
                            value['location_radius'],
                            value['expiration_date'],
                            value['created_on'],
                            value['full_id']
                        )
                    })
                    resolve(bookPetitions)
                }
            })
        })
    }

    public async getPetitionById(petitionId: string): Promise<BookPetition> {
        return new Promise<BookPetition>((resolve, reject) => {
            const query = `select *, bin_to_uuid(id) as full_id, bin_to_uuid(book_id) as full_book_id, bin_to_uuid(user_id) as full_user_id from book_petition 
            where id = ?;`

            myPool.query({
                sql: query,
                values: [petitionId]
            }, (error, results: Array<any>) => {
                if(error){
                    reject(error)
                } else {
                    const bookPetitions: BookPetition[] = results.map<BookPetition>((value) => {
                        return new BookPetition(
                            value['full_book_id'],
                            value['full_user_id'],
                            value['description'],
                            value['lending'],
                            value['selling'],
                            value['status'], 
                            [value['geolocation'].x, value['geolocation'].y],
                            value['location_radius'],
                            value['expiration_date'],
                            value['created_on'],
                            value['full_id']
                        )
                    })
                    resolve(bookPetitions[0])
                }
            })
        })
    }

    public async getPetitionsByUser(userId: string, expired: boolean, status?: string, lending?: number, selling?: number, page: number = 1, limit: number = 25): Promise<BookPetition[]> {
        return new Promise<BookPetition[]>((resolve, reject) => {
            const query = `select *, bin_to_uuid(id) as full_id, bin_to_uuid(book_id) as full_book_id, bin_to_uuid(user_id) as full_user_id from book_petition 
            where user_id = ? 
            and expiration_date ${expired? '<':'>'} now() 
            ${status? 'and status = ? ':''}
            ${lending != undefined? 'and lending = ? ':''}
            ${selling != undefined? 'and selling = ? ':''}
            limit ? 
            offset ?;`

            const v = []
            v.push(userId)
            if(status) v.push(status)
            if(lending != undefined) v.push(lending)
            if(selling != undefined) v.push(selling)
            v.push(limit)
            v.push(limit*(page-1))

            myPool.query({
                sql: query,
                values: v
            }, (error, results: Array<any>) => {
                if(error){
                    reject(error)
                } else {
                    const bookPetitions: BookPetition[] = results.map<BookPetition>((value) => {
                        return new BookPetition(
                            value['full_book_id'],
                            value['full_user_id'],
                            value['description'],
                            value['lending'],
                            value['selling'],
                            value['status'], 
                            [value['geolocation'].x, value['geolocation'].y],
                            value['location_radius'],
                            value['expiration_date'],
                            value['created_on'],
                            value['full_id']
                        )
                    })
                    resolve(bookPetitions)
                }
            })
        })
    }

    public async insertBookPetition(userId: string, isbn: string, status: string, description: string, lending: number, selling: number, geolocation: [number, number], locationRadius: number, expirationDate: Date): Promise<string> {
        try {
            const bookController = new BooksController()

            const book = await bookController.getBookByISBN(isbn)
            if(!book) {
                throw new Error(`Book with ISBN ${isbn} not found.`)
            }

            return new Promise<PoolConnection>((resolve, reject) => {
                myPool.getConnection((error, connection) => {
                    if(error){
                        reject(error)
                    } else {
                        resolve(connection)
                    }
                })
            }).then((connection) => {
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
                    const bookId = await bookController.insertBook(book, connection)
                    for(let i = 0; i < book.authors.length; i++){
                        let name = book.authors[i]
                        let authorId = await bookController.insertAuthor(name, connection)
                        await bookController.addAuthorToBook(authorId, bookId, connection)
                    }

                    return new Promise<string>((resolve, reject) => {
                        let query = `set @petitionId = uuid_to_bin(uuid()); 
                        insert into book_petition (id, user_id, book_id, status, description, lending, selling, geolocation, location_radius, expiration_date) 
                        values (@petitionId, uuid_to_bin(?), uuid_to_bin(?), ?, ?, ?, ?, ST_GeomFromText('Point(? ?)'), ?, ?); 
                        select bin_to_uuid(@petitionId) as petitionId;`
            
                        connection.query({
                            sql: query,
                            values: [userId, bookId, status, description, lending, selling, geolocation[0], geolocation[1], locationRadius, expirationDate]
                        }, (error, results: Array<Array<any>>) => {
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
                                        resolve(results[2][0]['petitionId'])
                                    }
                                })
                            }
                        })
                    })
                } catch (error){
                    connection.rollback((error) => {
                        if(error){
                            console.log(error)
                        }
                    })
                    throw new Error(error.message)
                }
            })

        } catch(error){
            throw new Error(error.message)
        }
    }

    public async updateBookPetition(petitionId: string, status?: string, description?: string, lending?: number, selling?: number, geolocation?: [number, number], locationRadius?: number, expirationDate?: Date): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            let query = `update book_petition set 
            ${status? 'status = ? ':''}
            ${description? 'description = ? ':''}
            ${lending != undefined? 'lending = ? ':''}
            ${selling != undefined? 'selling = ? ':''}
            ${geolocation? `geolocation = ST_GeomFromText('Point(? ?)') `:''}
            ${locationRadius? 'location_radius = ? ':''}
            ${expirationDate? 'expiration_date = ? ':''}
            where id = ?;`
            
            const v = []
            if(status) v.push(status)
            if(description) v.push(description)
            if(lending != undefined) v.push(lending)
            if(selling != undefined) v.push(selling)
            if(geolocation) {
                v.push(geolocation[0])
                v.push(geolocation[1])
            }
            if(locationRadius) v.push(locationRadius)
            if(expirationDate) v.push(expirationDate)
            v.push(petitionId)

            myPool.query({
                sql: query,
                values: v
            }, (error, results) => {
                if(error){
                    reject(error)
                } else {
                    if(results.affectedRows == 0){
                        resolve(false)
                    } else {
                        resolve(true)
                    }
                }
            })
        })
    }
}