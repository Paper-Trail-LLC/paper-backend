export class BookPetition {
    petitionId?: string
    bookId: string
    userId: string
    description: string
    lending: number
    selling: number
    status: string
    geolocation: [number, number]
    locationRadius: number
    expirationDate: Date
    createdOn: Date

    constructor(bookId: string, userId: string, description: string, lending: number, selling: number, status: string, geolocation: [number, number], locationRadius: number, expirationDate: Date, createdOn: Date, petitionId?: string){
        this.petitionId = petitionId
        this.bookId = bookId
        this.userId = userId
        this.description = description
        this.lending = lending
        this.selling = selling
        this.status = status
        this.geolocation = geolocation
        this.locationRadius = locationRadius
        this.expirationDate = expirationDate
        this.createdOn = createdOn
    }
}