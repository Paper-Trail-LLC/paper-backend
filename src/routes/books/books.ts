import express, { Request, Response } from "express";
import {Book} from "../../models/book";
import {BooksController} from "./books.controller"
/**
 * Router Definition
 */
export const booksRouter = express.Router();

/**
 * Routes and method definitions
 */
const booksController: BooksController = new BooksController()

booksRouter.get('/', async (req: Request, res: Response): Promise<void> => {
    res.json({
        message: 'This is the books endpoint',
        query: req.query
    });
});

booksRouter.get('/isbn/:isbn', async (req: Request, res: Response): Promise<void> => {
    try{
        const book = await booksController.getBookByISBN(req.params.isbn)
        if(!book){
            res.status(404).json({
                message: `Book with ISBN number ${req.params.isbn} not found`
            })
        } else {
            res.json({
                data: book
            });
        }
    } catch(error){
        res.status(500).json({
            error: error.message
        })
    }
});

booksRouter.get('/search', async (req: Request, res: Response): Promise<void> => {
    try{
        const keywords: string = req.query.keywords as string
        const page: number = +(req.query.page as string)
        const limit: number = +(req.query.limit as string)
        const criteria: string = req.query.criteria as string

        if(!keywords || !page || !limit){
            res.status(400).json({
                message: "Query parameters 'keywords', 'page', 'limit' are required."
            })
            return
        }

        let books: Book[]

        switch (criteria) {
            case 'title':
                books = await booksController.searchBooksByTitle(keywords, limit, page)
                break
            case 'author':
                books = await booksController.searchBooksByAuthor(keywords, limit, page)
                break
            default:
                books = await booksController.searchBooks(keywords, limit, page)
                break
        }

        res.json({
            data: books
        });
    } catch(error){
        res.status(500).json({
            error: error.message
        })
    }
})