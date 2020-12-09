export class OwnershipHistory {
    userBookId: string
    currentOwnerId: string
    newOwnerId: string

    constructor(userBookId: string, currentOwnerId: string, newOwnerId: string){
        this.userBookId = userBookId
        this.currentOwnerId = currentOwnerId
        this.newOwnerId = newOwnerId
    }
}