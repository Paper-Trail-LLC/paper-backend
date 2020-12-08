import { Agreement } from "./agreement";

export class BorrowAgreement extends Agreement {
    returnDate?: Date
    requests: any[]

    constructor(userBookId: string, userId: string, status: string, createdOn: Date, updatedOn: Date, requests: any[], id?: string, returnDate?: Date) {
        super(userBookId, userId, status, createdOn, updatedOn, id)
        this.returnDate = returnDate
        this.requests = requests
    }
}