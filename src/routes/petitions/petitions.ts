import { BookPetition } from "@src/models/petition";
import express, { Request, Response } from "express";
import { PetitionsController } from './petitions.controller'
/**
 * Router Definition
 */
export const petitionsRouter = express.Router();

/**
 * Routes and method definitions
 */
const petitionsController: PetitionsController = new PetitionsController()

petitionsRouter.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'This is the petition endpoint',
        query: req.query
    });
})

/*
Create petition

Input:
    Body: 
    {
        isbn: string
        userId: string
        description: string
        lending: number //Possible values: 1, 0
        selling: number //Possible values: 1, 0
        status: string
        lat: number
        lon: number
        locationRadius: number //Unit: Metre
        expirationDate: Date
    }
Output:
    {
        success: boolean
        bookPetitionId: string
    }
*/
petitionsRouter.post('/', async (req: Request, res: Response): Promise<void> => {
    try{
        const userId: string = req.body.userId as string
        const isbn: string = req.body.isbn as string
        const description: string = req.body.description as string
        const lending: number = +(req.body.lending as string)
        const selling: number = +(req.body.selling as string)
        const status: string = req.body.status as string
        const lat: number = +(req.body.lat as string)
        const lon: number = +(req.body.lon as string)
        const locationRadius: number = +(req.body.locationRadius as string)
        const expirationDate: string = req.body.expirationDate as string

        if(!isbn || !description || lending == NaN || selling == NaN || !status || lat == NaN || lon == NaN || locationRadius == NaN || !expirationDate){
            res.status(400).json({
                error: 'Missing parameters in body. userId, bookId, status, description, lending, selling, lon, lat, locationRadius, expirationDate are required.'
            })
            return
        }

        const bookPetitionId: string = await petitionsController.insertBookPetition(userId, isbn, status, description, lending, selling, [lon, lat], locationRadius, new Date(expirationDate))
        
            res.status(201).json({
                success: true,
                bookPetitionId: bookPetitionId
            })

    } catch(error){
        res.status(500).json({
            error: error.message
        })
    }
})

/*
Search petitions

Input: 
    Query Parameters:
        page: number (Optional)
        limit: number (Optional)
        isbn: string (Optional)
        selling: number (Optional) //Possible values: 1, 0
        lending: number (Optional) //Possible values: 1, 0
        status: string (Optional)
        currentLat: number (Optional) //Required if searching by distance
        currentLon: number (Optional) //Required if searching by distance
        searchRadius: number (Optional) //Required if searching by distance //Unit: Metre
        expired: boolean (Optional) //Possible values: 'true'
Output:
    {
        data: [
            {
                petitionId: string
                bookId: string
                userId: string
                description: string
                lending: number
                selling: number
                status: string
                geolocation: [number, number] //Format is [longitud, latitud]
                locationRadius: number //Unit: Metre
                expirationDate: Date
                createdOn: Date
            }
        ]
    }
*/
petitionsRouter.get('/search', async (req: Request, res: Response): Promise<void> => {
    try {
        const page: number | undefined = +(req.query.page as string) || undefined
        const limit: number | undefined = +(req.query.limit as string) || undefined
    
        const isbn: string = req.query.isbn as string
        const selling: number | undefined = +(req.query.selling as string) || undefined
        const lending: number | undefined = +(req.query.lending as string) || undefined
        const status: string = req.query.status as string
        const currentLat: number | undefined = +(req.query.currentLat as string) || undefined
        const currentLon: number | undefined = +(req.query.currentLon as string) || undefined
        const searchRadius: number | undefined = +(req.query.searchRadius as string) || undefined
        const expired: boolean = (req.query.expired as string) === 'true'? true : false

        let currentLocation: [number, number] | undefined = undefined 
        if(currentLat && currentLon){
            currentLocation = [currentLon, currentLat]
        }

        if(currentLocation && !searchRadius){
            res.status(400).json({
                error: 'Must provide currentLat, currentLon and searchRadius'
            })
            return
        }

        const petitions: BookPetition[] = await petitionsController.searchPetitions(expired, isbn, status, lending, selling, currentLocation, searchRadius, page, limit)
        
        res.json({
            data: petitions
        });

    } catch(error) {
        res.status(500).json({
            error: error.message
        })
    }
})

/*
Get petitions created by user with given userId

Input:
    userId in url path
    Query Parameters:
        page: number (Optional)
        limit: number (Optional)
        selling: number (Optional) //Possible values: 1, 0
        lending: number (Optional) //Possible values: 1, 0
        status: string (Optional)
        expired: boolean (Optional) //Possible values: 'true'
Output:
    {
        data: [
            {
                petitionId: string
                bookId: string
                userId: string
                description: string
                lending: number
                selling: number
                status: string
                geolocation: [number, number] //Format is [longitud, latitud]
                locationRadius: number //Unit: Metre
                expirationDate: Date
                createdOn: Date
            }
        ]
    }
*/
petitionsRouter.get('/user/:userId', async (req: Request, res: Response): Promise<void> => {
    try{
        const userId: string = req.params.userId
        const page: number | undefined = +(req.query.page as string) || undefined
        const limit: number | undefined = +(req.query.limit as string) || undefined

        const selling: number | undefined = +(req.query.selling as string) || undefined
        const lending: number | undefined = +(req.query.lending as string) || undefined
        const status: string = req.query.status as string
        const expired: boolean = (req.query.expired as string) === 'true'? true : false

        const bookPetitions: BookPetition[] = await petitionsController.getPetitionsByUser(userId, expired, status, lending, selling, page, limit)

        res.json({
            data: bookPetitions
        })
    } catch(error) {
        res.status(500).json({
            error: error.message
        })
    }
})

/*
Get petition by id

Input: 
    petitionId in url path
Output:
    Body:
    {
        data: {
            petitionId: string
            bookId: string
            userId: string
            description: string
            lending: number
            selling: number
            status: string
            geolocation: [number, number] //Format is [longitud, latitud]
            locationRadius: number //Unit: Metre
            expirationDate: Date
            createdOn: Date
        }
    }
*/
petitionsRouter.get('/:petitionId', async (req: Request, res: Response): Promise<void> => {
    try {
        const petitionId: string = req.params.petitionId

        const petition: BookPetition = await petitionsController.getPetitionById(petitionId)

        res.json({
            data: petition
        });

    } catch(error) {
        res.status(500).json({
            error: error.message
        })
    }
})

/*
Edit petition with given petitionId

Input:
    petitionId in url path
    Body:
        {
            userId: string
            description: string
            selling: number (Optional) //Possible values: 1, 0
            lending: number (Optional) //Possible values: 1, 0
            status: string
            lat: number
            lon: number
            locationRadius: number //Unit: Metre
            expirationDate: Date
        }
Output:
    Status Code 204. Does not return body if successful.
*/
petitionsRouter.put('/:petitionId', async (req: Request, res: Response) => {
    try{
        const petitionId: string = req.params.petitionId
        const description: string = req.body.description as string
        const lending: number | undefined = +(req.body.lending as string) || undefined
        const selling: number | undefined = +(req.body.selling as string) || undefined
        const status: string = req.body.status as string
        const lat: number | undefined = +(req.body.lat as string) || undefined
        const lon: number | undefined = +(req.body.lon as string) || undefined
        const locationRadius: number | undefined = +(req.body.locationRadius as string) || undefined
        const expirationDate: Date | undefined = req.body.expirationDate as string ? new Date(req.body.expirationDate as string) : undefined

        let geolocation: [number, number] | undefined = undefined 
        if(lat && lon){
            geolocation = [lon, lat]
        }

        const success: boolean = await petitionsController.updateBookPetition(petitionId, status, description, lending, selling, geolocation, locationRadius, expirationDate)
        
        if(success){
            res.status(204).json({
                success: true
            })
        } else {
            res.status(400).json({
                success: false,
                error: 'Petition id does not match any petitions in the database.'
            })
        }

    } catch(error){
        res.status(500).json({
            error: error.message
        })
    }
})