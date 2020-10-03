import express, { Request, Response } from "express";
import {BooksController} from "./books.controller"
/**
 * Router Definition
 */
export const booksRouter = express.Router();

/**
 * Routes and method definitions
 */
booksRouter.get('/', async (req: Request, res: Response): Promise<void> => {
    res.json({
        message: 'This is the books endpoint',
        query: req.query
    });
});