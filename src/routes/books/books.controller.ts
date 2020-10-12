import myPool from "../../helpers/mysql.pool"
import {PoolConnection} from "mysql"
import {Book} from "../../models/book"
import ExternalAPI from "../../helpers/external.api.client"

export class BooksController {
    public async getAllBooks(limit: number = 25, page: number = 0): Promise<Book[]> {
        return [];
    }
    public async getBookByISBN(isbn: string): Promise<Book|null> {
        try{
            //TODO First search in local DB

            //If not found, search in external api
            const response: any = await ExternalAPI.get('/book/'+isbn)
            const book: any = response.data.book
            const result = new Book(book.title, book.authors, book.isbn, book.date_published, book.edition, book.image)
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
                return new Book(book.title, book.authors, book.isbn, book.date_published, book.edition, book.image)
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
                return new Book(book.title, book.authors, book.isbn, book.date_published, book.edition, book.image)
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
                return new Book(book.title, book.authors, book.isbn, book.date_published, book.edition, book.image)
            })
            return result
        } catch(error) {
            if(error.response.status == 404){
                return []
            }
            throw new Error(error.message)
        }
    }
}