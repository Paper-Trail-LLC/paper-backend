import { Book } from "../../models/book";
import express, { Request, Response } from "express";
import { UserBooksController } from './userbooks.controller'
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

/*
Search books owned by users (example: listings)

Input:
    Query Parameters:
        isbn: string (Optional)
        status: string (Optional)
        selling: number (Optional) //Possible values: 1, 0
        lending: number (Optional) //Possible values: 1, 0
        distance: number (Optional) //Required if searching by distance //Unit: Metre
        lat: number (Optional) //Required if searching by distance
        lon: number (Optional) //Required if searching by distance
        limit: number
        page: number
Output:
    {
        data: [
            {
                userBookId: string
                userId: string
                status: string
                selling: number
                lending: number
                geolocation: [number, number] //Format [longitud, latitud]
                bookId: string
                synopsys: string
                title: string
                authors: string[]
                isbn: string
                isbn13: string 
                releaseDate: Date
                edition: string
                coverURI: string
                images: string[]
            }
        ]
    }
*/
userBooksRouter.get('/search', async (req: Request, res: Response): Promise<void> => {
    try {
        const isbn: string = req.query.isbn as string
        const status: string = req.query.status as string
        const selling: number = +(req.query.selling as string)
        const lending: number = +(req.query.selling as string)
        const distance: number = +(req.query.distance as string)
        const lat: number = +(req.query.lat as string)
        const lon: number = +(req.query.lon as string)
        const limit: number = +(req.query.limit as string)
        const page: number = +(req.query.page as string)

        if (!limit || !page) {
            res.status(400).json({
                error: "Query parameters 'isbn', 'limit', 'page' is required."
            })
        } else if (isbn && isbn.length != 10 && isbn.length != 13) {
            res.status(400).json({
                error: "Query parameter 'isbn' must be of length 0 or 13."
            })
        } else if (lending && (lending != 0 && lending != 1)) {
            res.status(400).json({
                error: "Query parameter 'lending' must be 0 or 1."
            })
        } else if (selling && (selling != 0 && selling != 1)) {
            res.status(400).json({
                error: "Query parameter 'selling' must be 0 or 1."
            })
        } else if (distance && (!lat || !lon)) {
            res.status(400).json({
                error: "Query parameters 'lat' and 'lon' are required when 'distance' is used."
            })
        } else {
            const userBook = await userBooksController.searchUserBooks(isbn, [lon, lat], distance, status, lending, selling, limit, page)
            res.json({
                data: userBook
            });
        }

    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }

});

/*
Get books in library of user

Input:
    userId in url path
    Query Parameters:
        limit: number
        page: number
Output:
    {
        data: [
            {
                userBookId: string
                userId: string
                status: string
                selling: number
                lending: number
                geolocation: [number, number] //Format [longitud, latitud]
                bookId: string
                synopsys: string
                title: string
                authors: string[]
                isbn: string
                isbn13: string 
                releaseDate: Date
                edition: string
                coverURI: string
                images: string[]
            }
        ]
    }
*/
userBooksRouter.get('/library/:userId', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId
        const limit: number = +(req.query.limit as string)
        const page: number = +(req.query.page as string)

        if (!limit || !page) {
            res.status(400).json({
                error: "Query parameters 'limit', 'page' is required."
            })
        } else {
            const userBooks = await userBooksController.getLibraryOfUser(userId, limit, page)
            res.status(200).json({
                data: userBooks
            })
        }

    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
});

/*
Add book to library

Input:
    userId in url path
    Body:
        {
            isbn13: string
            status: string
            selling: number //Possible values: 1, 0
            lending: number //Possible values: 1, 0
            lat: number
            lon: number
        }
Output:
    {
        data: {
            success: boolean
            userBookId: string
        }
    }
*/
userBooksRouter.post('/library/:userId', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId: string = req.params.userId
        const status: string = req.body.status
        const lending: number = req.body.lending
        const selling: number = req.body.selling
        const lat: number = req.body.lat
        const lon: number = req.body.lon
        const isbn13: string = req.body.isbn13

        if (!status || !lending || !selling || !lat || !lon || !isbn13) {
            res.status(400).json({
                error: 'Missing parameters in body. userId, status, lending, selling, lat, lon and isbn13 are required.'
            })
        } else {
            const userBookId = await userBooksController.addBookToLibrary(userId, status, lending, selling, [lon, lat], isbn13)
            res.status(201).json({
                data: {
                    success: true,
                    userBookId: userBookId
                }
            })
        }
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
})


/*
Remove book from library

Input:
    user_book_id in url path
Output:
    {
        data: {
            success: boolean
        }
    }
*/
userBooksRouter.delete('/library/:user_book_id', async (req: Request, res: Response): Promise<void> => {
    try {
        const user_book_id: string = req.params.user_book_id;
        await userBooksController.deleteLibraryOfUser(user_book_id);
        res.status(200).json({
            data: {
                success: true,
            }
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
})


/*
Add custom book to library

Input:
    userId in url path
    Body:
        {
            isbn13: string
            status: string
            selling: number //Possible values: 1, 0
            lending: number //Possible values: 1, 0
            lat: number
            lon: number
            title: string
            authors: string[]
            isbn: string
            releaseDate: Date
            edition: string
            coverURI: string
            synopsys: string
        }
Output:
    {
        data: {
            success: boolean
            userBookId: string
        }
    }
*/
userBooksRouter.post('/library/:userId/custom', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId: string = req.params.userId
        const status: string = req.body.status
        const lending: number = req.body.lending
        const selling: number = req.body.selling
        const lat: number = req.body.lat
        const lon: number = req.body.lon
        const isbn13: string = req.body.isbn13

        const title: string = req.body.title
        const authors: string[] = req.body.authors
        const isbn: string = req.body.isbn
        const releaseDate: Date = new Date(req.body.releaseDate)
        const edition: string = req.body.edition
        const coverURI: string = req.body.coverURI
        const synopsys: string = req.body.synopsys


        if (!status || !lending || !selling || !lat || !lon || !isbn13 || !title || !authors || !isbn || !releaseDate || !edition || !coverURI) {
            res.status(400).json({
                error: 'Missing parameters in body. userId, status, lending, selling, lat, lon and isbn13 are required.'
            })
        } else {
            const book = new Book(title, authors, isbn, isbn13, releaseDate, edition, coverURI, undefined, synopsys)
            const userBookId = await userBooksController.addCustomBookToLibrary(book, userId, status, lending, selling, [lon, lat])
            res.status(201).json({
                data: {
                    success: true,
                    userBookId: userBookId
                }
            })
        }
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
})