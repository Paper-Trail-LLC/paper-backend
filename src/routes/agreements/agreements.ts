import { BorrowAgreement } from "@src/models/borrowAgreement";
import { MeetingAgreement } from "@src/models/meetingAgreement";
import { PurchaseAgreement } from "@src/models/purchaseAgreement";
import express, { Request, Response } from "express";
import { AgreementsController } from "./agreements.controller"

export const agreementsRouter = express.Router()

const agreementsController = new AgreementsController()

/*
Search for agreements (all three types)

Input: 
    Query Parameters:
        type: string (Required) //Possible values: 'meeting', 'borrow', 'purchase'
        userId: string (Optional)
        userBookId: string (Optional)
        status: string (Optional)
        lat: number (Required only if searching meeting request by distance)
        lon: number (Required only if searching meeting request by distance)
        distance: number (Required only if searching meeting agreement by distance)
        hasPassed: boolean (Optional for querying meeting agreement by whether meeting date has passed or borrow agreement by whether return date has passed) //Possible values: 'true', 'false'

Output:
    {
        data: {
            meetingAgreement (if type is 'meeting', otherwise undefined): [{
                id: string
                userBookId: string
                userId: string
                status: string
                createdOn: Date
                updatedOn: Date
                requests: any[]
                geolocation: [number, number] //Format: [longitud, latitude]
                place: string
                meetingDate: Date
            }],
            purchaseAgreement (if type is 'purchase', otherwise undefined): [{
                id: string
                userBookId: string
                userId: string
                status: string
                createdOn: Date
                updatedOn: Date
                requests: any[]
                price: number
            }],
            borrowAgreement (if type is 'borrow', otherwise undefined): [{
                id: string
                userBookId: string
                userId: string
                status: string
                createdOn: Date
                updatedOn: Date
                requests: any[]
                returnDate: Date
            }]
        }
    }
*/
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
                data: {
                    meetingAgreements
                }
            })
        } else if(type == 'borrow'){
            let userId: string | undefined = req.query.userId as string
            let userBookId: string | undefined = req.query.userBookId as string
            let status: string | undefined = req.query.status as string
            let hasPassed: boolean | undefined = req.query.hasPassed == 'true'? true : req.query.hasPassed == 'false'? false : undefined

            const borrowAgreement: BorrowAgreement[] = await agreementsController.searchBorrowAgreements(userId, userBookId, status, hasPassed, page, limit)
            res.json({
                data: {
                    borrowAgreement
                }
            })
        } else if(type == 'purchase'){
            let userId: string | undefined = req.query.userId as string
            let userBookId: string | undefined = req.query.userBookId as string
            let status: string | undefined = req.query.status as string

            const purchaseAgreement: PurchaseAgreement[] = await agreementsController.searchPurchaseAgreements(userId, userBookId, status, page, limit)
            res.json({
                data: {
                    purchaseAgreement
                }
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

/*
Add a request to existing agreements. If the agreementId is not provided, a new agreement will be created and the request added. Can handle one agreement of each type simultaneously in one API call.

Input: 
    Body: {
        meetingAgreement(Optional): {
                agreementId: string (Required ONLY IF ADDING A REQUEST TO EXISTING AGREEMENT. IF NOT INCLUDED, A NEW AGREEMENT WILL BE CREATED)
                userBookId: string
                userId: string
                status: string
                lat: number
                lon: number
                place: string
                meetingDate: Date
        },
        borrowAgreement(Optional): {
                agreementId: string (Required ONLY IF ADDING A REQUEST TO EXISTING AGREEMENT. IF NOT INCLUDED, A NEW AGREEMENT WILL BE CREATED)
                userBookId: string
                userId: string
                status: string
                returnDate: Date
        },
        purchaseAgreement(Optional): {
                agreementId: string (Required ONLY IF ADDING A REQUEST TO EXISTING AGREEMENT. IF NOT INCLUDED, A NEW AGREEMENT WILL BE CREATED)
                userBookId: string
                userId: string
                status: string
                price: number
        }
    }

Output:
    {
        success: boolean
        meetingAgreementId: string (If meeting agreement was part of input. Otherwise undefined),
        purchaseAgreementId: string (If purchase agreement was part of input. Otherwise undefined),
        borrowAgreementId: string (If borrow agreement was part of input. Otherwise undefined)
    }
*/
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
                purchaseAgreementId: pId,
                borrowAgreementId: bId
            })
        }

    } catch(error){
        res.status(500).json({
            error: error.message
        })
    }
})

/*
Accept the final request of each agreement id.

Input:
    Body: {
        meetingAgreementId: string
        borrowAgreementId: string
        purchaseAgreementId: string
    }
Output:
    {
        success: true,
        meetingAgreement: mSuccess,
        purchaseAgreement: pSuccess,
        borrowAgreement: bSuccess
    }
*/
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
                meetingAgreement: mSuccess,
                purchaseAgreement: pSuccess,
                borrowAgreement: bSuccess
            })
        }

    } catch(error){
        res.status(500).json({
            error: error.message
        })
    }
})

/*
Get agreement by id

Input:
    URL path:
        type: string //Possible values: 'meeting-agreement', 'purchase-agreement', 'borrow-agreement'
        id: string (agreementId)

Output: 
{
    data: {
        meetingAgreement (if type is 'meeting', otherwise undefined): {
            id: string
            userBookId: string
            userId: string
            status: string
            createdOn: Date
            updatedOn: Date
            requests: any[]
            geolocation: [number, number] //Format: [longitud, latitude]
            place: string
            meetingDate: Date
        },
        purchaseAgreement (if type is 'purchase', otherwise undefined): {
            id: string
            userBookId: string
            userId: string
            status: string
            createdOn: Date
            updatedOn: Date
            requests: any[]
            price: number
        },
        borrowAgreement (if type is 'borrow', otherwise undefined): {
            id: string
            userBookId: string
            userId: string
            status: string
            createdOn: Date
            updatedOn: Date
            requests: any[]
            returnDate: Date
        }
    }
}
*/
agreementsRouter.get('/:type/:id', async (req: Request, res: Response) => {
    try{
        let agreementId: string = req.params.id
        let type: string = req.params.type

        let result
        switch(type){
            case 'meeting-agreement':
                result = await agreementsController.getMeetingAgreementById(agreementId)
                res.json({
                    data: {
                        meetingAgreement: result
                    }
                })
                break
            case 'purchase-agreement':
                result = await agreementsController.getPurchaseAgreementById(agreementId)
                res.json({
                    data: {
                        purchaseAgreement: result
                    }
                })
                break
            case 'borrow-agreement':
                result = await agreementsController.getBorrowAgreementById(agreementId)
                res.json({
                    data: {
                        borrowAgreement: result
                    }
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

