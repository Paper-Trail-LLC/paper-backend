import { BorrowAgreement } from "@src/models/borrowAgreement";
import { MeetingAgreement } from "@src/models/meetingAgreement";
import { PurchaseAgreement } from "@src/models/purchaseAgreement";
import express, { Request, Response } from "express";
import { AgreementsController } from "./agreements.controller"

export const agreementsRouter = express.Router()

const agreementsController = new AgreementsController()

agreementsRouter.get('/search', async (req: Request, res: Response) => {
    try{
        let type: string = req.query.type as string
        let page: number | undefined = +(req.query.page as string) || undefined
        let limit: number | undefined = +(req.query.limit as string) || undefined

        if(type == 'meeting'){
            let userId: string | undefined = req.query.userId as string
            let userBookId: string | undefined = req.query.userBookId as string
            let status: string | undefined = req.query.status as string
            let lat: number | undefined = +(req.query.lat as string) || undefined
            let lon: number | undefined = +(req.query.lon as string) || undefined
            let distance: number | undefined = +(req.query.distance as string) || undefined
            let hasPassed: boolean | undefined = req.query.hasPassed == 'true'? true : req.query.hasPassed == 'false'? false : undefined

            let geolocation: [number, number] | undefined = undefined 
            if(lat && lon){
                geolocation = [lon, lat]
            }

            if(geolocation && !distance){
                res.status(400).json({
                    error: 'Must provide lat, lon and distance to query by geolocation'
                })
                return
            }

            const meetingAgreements: MeetingAgreement[] = await agreementsController.searchMeetingAgreements(userId, userBookId, status, distance, geolocation, hasPassed, page, limit)
            res.json({
                data: meetingAgreements
            })
        } else if(type == 'borrow'){
            let userId: string | undefined = req.query.userId as string
            let userBookId: string | undefined = req.query.userBookId as string
            let status: string | undefined = req.query.status as string
            let hasPassed: boolean | undefined = req.query.hasPassed == 'true'? true : req.query.hasPassed == 'false'? false : undefined

            const borrowAgreement: BorrowAgreement[] = await agreementsController.searchBorrowAgreements(userId, userBookId, status, hasPassed, page, limit)
            res.json({
                data: borrowAgreement
            })
        } else if(type == 'purchase'){
            let userId: string | undefined = req.query.userId as string
            let userBookId: string | undefined = req.query.userBookId as string
            let status: string | undefined = req.query.status as string

            const purchaseAgreement: PurchaseAgreement[] = await agreementsController.searchPurchaseAgreements(userId, userBookId, status, page, limit)
            res.json({
                data: purchaseAgreement
            })
        } else {
            res.status(400).json({
                error: "Agreement Type must be provided. ('meeting', 'purchase', 'borrow')"
            })
        }
        
    } catch(error) {
        res.status(500).json({
            error: error.message
        })
    }
})

agreementsRouter.post('/agreement-request', async (req: Request, res: Response) => {
    try{
        let mId: string | undefined
        let bId: string | undefined 
        let pId: string | undefined

        if(req.body.meetingAgreement){
            let agreementId: string | undefined = req.body.meetingAgreement.agreementId as string
            let userId: string = req.body.meetingAgreement.userId as string
            let userBookId: string | undefined = req.body.meetingAgreement.userBookId as string
            let status: string | undefined = req.body.meetingAgreement.status as string
            let lat: number = req.body.meetingAgreement.lat as number
            let lon: number = req.body.meetingAgreement.lon as number
            let place: string = req.body.meetingAgreement.place as string
            let meetingDate: string = req.body.meetingAgreement.meetingDate as string

            mId = await agreementsController.addRequestToMeetingAgreement(userId, [lon, lat], place, new Date(meetingDate), agreementId, userBookId, status)
        }

        if(req.body.borrowAgreement){
            let agreementId: string | undefined = req.body.borrowAgreement.agreementId as string
            let userId: string = req.body.borrowAgreement.userId as string
            let userBookId: string | undefined = req.body.borrowAgreement.userBookId as string
            let status: string | undefined = req.body.borrowAgreement.status as string
            let returnDate: string = req.body.borrowAgreement.returnDate as string

            bId = await agreementsController.addRequestToBorrowAgreement(userId, new Date(returnDate), agreementId, userBookId, status)
        }

        if(req.body.purchaseAgreement){
            let agreementId: string | undefined = req.body.borrowAgreement.agreementId as string
            let userId: string = req.body.borrowAgreement.userId as string
            let userBookId: string | undefined = req.body.borrowAgreement.userBookId as string
            let status: string | undefined = req.body.borrowAgreement.status as string
            let price: number = req.body.borrowAgreement.price as number

            pId = await agreementsController.addRequestToPurchaseAgreement(userId, price, agreementId, userBookId, status)
        }

        if(!pId && !mId && !bId){
            res.status(400).json({
                success: false,
                error: "No agreements were given"
            })
        } else {
            res.status(201).json({
                success: true,
                meetingAgreementId: mId,
                purchasAgreementId: pId,
                borrowAgreementId: bId
            })
        }

    } catch(error){
        res.status(500).json({
            error: error.message
        })
    }
})

agreementsRouter.put('/accept-agreement', async (req: Request, res: Response) => {
    try{
        let mSuccess: boolean = false
        let bSuccess: boolean = false
        let pSuccess: boolean = false

        let mId: string = req.body.meetingAgreementId as string
        let bId: string = req.body.borrowAgreementId as string
        let pId: string = req.body.purchaseAgreementId as string

        if(mId){
            mSuccess = await agreementsController.acceptMeetingAgreement(mId)
        }

        if(bId){
            bSuccess = await agreementsController.acceptBorrowAgreement(bId)
        }

        if(pId){
            pSuccess = await agreementsController.acceptPurchaseAgreement(pId)
        }

        if(!mId && !pId && !bId){
            res.status(400).json({
                success: false,
                error: "No agreement ids were given"
            })
        } else {
            res.status(201).json({
                success: true,
                meetingAgreementId: mId,
                purchasAgreementId: pId,
                borrowAgreementId: bId
            })
        }

    } catch(error){
        res.status(500).json({
            error: error.message
        })
    }
})

agreementsRouter.get('/:type/:id', async (req: Request, res: Response) => {
    try{
        let agreementId: string = req.params.id
        let type: string = req.params.type

        let result
        switch(type){
            case 'meeting-agreement':
                result = await agreementsController.getMeetingAgreementById(agreementId)
                res.json({
                    data: result
                })
                break
            case 'purchase-agreement':
                result = await agreementsController.getPurchaseAgreementById(agreementId)
                res.json({
                    data: result
                })
                break
            case 'borrow-agreement':
                result = await agreementsController.getBorrowAgreementById(agreementId)
                res.json({
                    data: result
                })
                break
            default:
                res.status(400).json({
                    error: "Agreement type not valid. Only 'meeting-agreement', 'purchase-agreement', or 'borrow-agreement' are valid."
                })
        }
    } catch(error){
        res.status(500).json({
            error: error.message
        })
    }
})

