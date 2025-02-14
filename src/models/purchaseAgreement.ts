import { Agreement } from "./agreement";

export class PurchaseAgreement extends Agreement {
    price?: number
    requests: any[]

    constructor(userBookId: string, userId: string, status: string, createdOn: Date, updatedOn: Date, requests: any[], id?: string, price?: number) {
        super(userBookId, userId, status, createdOn, updatedOn, id)
        this.price = price
        this.requests = requests
    }
}