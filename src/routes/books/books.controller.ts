import {Book} from "../../models/book"
import ExternalAPI from "../../helpers/external.api.client"
import myPool from "../../helpers/mysql.pool"
import { Pool, PoolConnection } from "mysql"

export class BooksController {
    // public async getAllBooks(limit: number = 25, page: number = 0): Promise<Book[]> {
    //     return [];
    // }
    public async getBookByISBN(isbn: string): Promise<Book|null> {
        try{
            //TODO First search in local DB

            //If not found, search in external api
            const response: any = await ExternalAPI.get('/book/'+isbn)
            const book: any = response.data.book
            let authors: string[] = book.authors
            const result = new Book(book.title, authors.filter(a => a), book.isbn, book.isbn13, book.date_published, book.edition, book.image, undefined, book.synopsys)
            return result
        } catch(error) {
            if(error.response.status == 404){
                return null
            }
            throw new Error(error.message)
        }
    }
    public async searchBooks(keywords: string, limit: number = 25, page: number = 0): Promise<Book[]> {
        try {
            const response: any = await ExternalAPI.get('/books/'+encodeURIComponent(keywords), {
                params: {
                    page: page,
                    pageSize: limit
                }
            })
            const books: any[] = response.data.books
            const result: Book[] = books.map<Book>((book: any): Book =>{
                let authors: string[] = book.authors
                return new Book(book.title, authors.filter(a => a), book.isbn, book.isbn13, book.date_published, book.edition, book.image, undefined, book.synopsys)
            })
            return result
        } catch(error) {
            if(error.response.status == 404){
                return []
            }
            throw new Error(error.message)
        }
    }
    public async searchBooksByTitle(title: string, limit: number = 25, page: number = 0): Promise<Book[]>{
        try {
            const response: any = await ExternalAPI.get('/books/'+encodeURIComponent(title), {
                params: {
                    page: page,
                    pageSize: limit,
                    column: 'title'
                }
            })
            const books: any[] = response.data.books
            const result: Book[] = books.map<Book>((book: any): Book =>{
                let authors: string[] = book.authors
                return new Book(book.title, authors.filter(a => a), book.isbn, book.isbn13, book.date_published, book.edition, book.image, undefined, book.synopsys)
            })
            return result
        } catch(error) {
            if(error.response.status == 404){
                return []
            }
            throw new Error(error.message)
        }
    }
    public async searchBooksByAuthor(author: string, limit: number = 25, page: number = 0): Promise<Book[]>{
        try {
            const response: any = await ExternalAPI.get('/books/'+encodeURIComponent(author), {
                params: {
                    page: page,
                    pageSize: limit,
                    column: 'author'
                }
            })
            const books: any[] = response.data.books
            const result: Book[] = books.map<Book>((book: any): Book =>{
                let authors: string[] = book.authors
                return new Book(book.title, authors.filter(a => a), book.isbn, book.isbn13, book.date_published, book.edition, book.image, undefined, book.synopsys)
            })
            return result
        } catch(error) {
            if(error.response.status == 404){
                return []
            }
            throw new Error(error.message)
        }
    }

    public async insertBook(book: Book, connection?: PoolConnection): Promise<string> {
        return new Promise((resolve, reject) => {
            let p: Pool | PoolConnection = connection ? connection:myPool
            let insertBookQuery = `set @bookId = uuid_to_bin(uuid()); 
            insert into book (id, title, isbn13, release_date, edition, image_url, isbn, synopsys) values(@bookId, ?, ?, ?, ?, ?, ?, ?); 
            select @bookId;`
            p.query({
                sql: insertBookQuery,
                values: [book.title, book.isbn13, new Date(book.releaseDate), book.edition, book.coverURI, book.isbn, book.synopsis]
            }, (error, results) => {
                if(error){
                    reject(error)
                } else {
                    resolve(results[2][0]['@bookId'])
                }
            })
        })
    }

    public async addAuthorToBook(authorId: string, bookId: string, connection?: PoolConnection): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let p: Pool | PoolConnection = connection ? connection:myPool
            let addBookAuthorQuery = `insert into book_author (book_id, author_id) values (?, ?)`
            p.query({
                sql: addBookAuthorQuery,
                values: [bookId, authorId]
            }, (error) => {
                if(error){
                    reject(error)
                } else {
                    resolve(true)
                }
            })
        })
    }

    public async insertAuthor(name: string, connection?: PoolConnection): Promise<string> {
        return new Promise((resolve, reject) => {
            let p: Pool | PoolConnection = connection ? connection:myPool
            let addBookAuthorQuery = `set @id = uuid_to_bin(uuid()); 
            insert into author (id, name) values (@id, ?); 
            select @id;`
            p.query({
                sql: addBookAuthorQuery,
                values: [name]
            }, (error, results) => {
                if(error){
                    reject(error)
                } else {
                    resolve(results[2][0]['@id'])
                }
            })
        })
    }
}