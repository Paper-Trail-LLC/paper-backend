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

petitionsRouter.get('/search', async (req: Request, res: Response) => {
    try {
        const page: number | undefined = +(req.query.page as string) || undefined
        const limit: number | undefined = +(req.query.limit as string) || undefined
    
        const selling: number | undefined = +(req.query.selling as string) || undefined
        const lending: number | undefined = +(req.query.lending as string) || undefined
        const status: string = req.query.status as string
        const currentLocation: number | undefined = +(req.query.currentLocation as string) || undefined
        const locationRadius: number | undefined = +(req.query.locationRadius as string) || undefined

        const petitions: BookPetition[] = await petitionsController.searchPetitions(status, lending, selling, currentLocation, locationRadius, page, limit)

        res.json({
            data: petitions
        });

    } catch(error) {
        res.status(500).json({
            error: error.message
        })
    }
})

petitionsRouter.get('/:userId', async (req: Request, res: Response) => {
    try{
        const userId: string = req.params.userId
        const page: number | undefined = +(req.query.page as string) || undefined
        const limit: number | undefined = +(req.query.limit as string) || undefined

        const selling: number | undefined = +(req.query.selling as string) || undefined
        const lending: number | undefined = +(req.query.lending as string) || undefined
        const status: string = req.query.status as string

        const bookPetitions: BookPetition[] = await petitionsController.getPetitionsByUser(userId, status, lending, selling, page, limit)

        res.json({
            data: bookPetitions
        })
    } catch(error) {
        res.status(500).json({
            error: error.message
        })
    }
})