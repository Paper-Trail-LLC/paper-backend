import express, { Request, Response } from "express";
import {UserBooksController} from './userbooks.controller'
import {UserBook} from '../../models/userbook'
/**
 * Router Definition
 */
export const userBooksRouter = express.Router();

/**
 * Routes and method definitions
 */
const userBooksController: UserBooksController = new UserBooksController()

userBooksRouter.get('/', async (req: Request, res: Response): Promise<void> => {
    res.json({
        message: 'This is the user books endpoint',
        query: req.query
    });
});

userBooksRouter.get('/search', async (req: Request, res: Response): Promise<void> => {
    try{
        const isbn: string = req.query.isbn as string
        const status: string = req.query.status as string
        const selling: number = +(req.query.selling as string)
        const lending: number = +(req.query.selling as string)
        const distance: number = +(req.query.distance as string)
        const lat: number = +(req.query.lat as string)
        const lon: number = +(req.query.lon as string)
        const limit: number = +(req.query.limit as string)
        const page: number = +(req.query.page as string)

        if(!isbn || !limit || !page){
            res.status(400).json({
                error: "Query parameters 'isbn', 'limit', 'page' is required."
            })
        } else if(isbn.length != 10 && isbn.length != 13){
            res.status(400).json({
                error: "Query parameter 'isbn' must be of length 0 or 13."
            })
        } else if(lending && (lending != 0 && lending != 1)){
            res.status(400).json({
                error: "Query parameter 'lending' must be 0 or 1."
            })
        } else if(selling && (selling != 0 && selling != 1)){
            res.status(400).json({
                error: "Query parameter 'selling' must be 0 or 1."
            })
        } else if(distance && (!lat || !lon)){
            res.status(400).json({
                error: "Query parameters 'lat' and 'lon' are required when 'distance' is used."
            })
        }

        const userBook = await userBooksController.searchUserBooks(isbn, [lat, lon], distance, status, lending, selling, limit, page)
        res.json({
            data: userBook
        });

    } catch(error){
        res.status(500).json({
            error: error.message
        })
    }
    
});