export class Agreement {
    id?: string
    userBookId: string
    userId: string
    status: string
    createdOn: Date
    updatedOn: Date

    constructor(userBookId: string, userId: string, status: string, createdOn: Date, updatedOn: Date, id?: string) {
        this.id = id
        this.userBookId = userBookId
        this.userId = userId
        this.status = status
        this.createdOn = createdOn
        this.updatedOn = updatedOn
    }
}