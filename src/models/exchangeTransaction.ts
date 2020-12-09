export class ExchangeTransaction {
    userBookId: string
    ownerId: string
    giver: string
    receiver: string

    constructor(userBookId: string, ownerId: string, giver: string, receiver: string){
        this.userBookId = userBookId
        this.ownerId = ownerId
        this.giver = giver
        this.receiver = receiver
    }
}