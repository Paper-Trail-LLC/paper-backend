import express, { Request, Response } from "express";
import BlockchainClient from "../../helpers/blockchain.client"

const bcClient = new BlockchainClient()

export const transactionsRouter = express.Router()

transactionsRouter.post('/exchange', async (req: Request, res: Response): Promise<void> => {
    try{
        const userBookId: string = req.body.userBookId as string
        const ownerId: string = req.body.ownerId as string
        const giver: string = req.body.giver as string
        const receiver: string = req.body.receiver as string

        if(!userBookId || !ownerId || !giver || !receiver){
            res.status(400).json({
                error: "Missing parameters. Body must include userBookId, ownerId, giver, receiver"
            })
        }

        const response = await bcClient.addExhangeTransaction(userBookId, ownerId, giver, receiver)
        res.status(201).json(response)
    } catch(error){
        res.status(500).json({
            error: error.message
        })
    }
})

transactionsRouter.post('/ownership-transfer', async (req: Request, res: Response): Promise<void> => {
    try{
        const userBookId: string = req.body.userBookId as string
        const currentOwnerId: string = req.body.currentOwnerId as string
        const newOwnerId: string = req.body.newOwnerId as string

        if(!userBookId || !currentOwnerId || !newOwnerId){
            res.status(400).json({
                error: "Missing parameters. Body must include userBookId, currentOwnerId, newOwnerId"
            })
        }

        const response = await bcClient.registerOwnershipChange(userBookId, currentOwnerId, newOwnerId)
        res.status(201).json(response)
    } catch(error){
        res.status(500).json({
            error: error.message
        })
    }
})

transactionsRouter.get('/exchange/:userBookId', async (req: Request, res: Response): Promise<void> => {
    try{
        const userBookId: string = req.params.userBookId as string

        const response = await bcClient.getExchangeTransactionsOfUserBook(userBookId)
        res.status(200).json(response)

    } catch(error){
        res.status(500).json({
            error: error.message
        })
    }
})

transactionsRouter.get('/ownership-transfer/:userBookId', async (req: Request, res: Response): Promise<void> => {
    try{
        const userBookId: string = req.params.userBookId as string

        const response = await bcClient.getOwnershipHistoryOfUserBook(userBookId)
        res.status(200).json(response)
        
    } catch(error){
        res.status(500).json({
            error: error.message
        })
    }
})