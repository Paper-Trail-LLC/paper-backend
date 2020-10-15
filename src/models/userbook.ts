import {Book} from './book'

export class UserBook extends Book {
    userBookId: string
    userId: string
    status: string
    selling: number
    lending: number
    geolocation: [number, number]
    images?: Array<string>

    constructor(userBookId: string, userId: string, bookId: string, title: string, authors: string[], isbn: string, releaseDate: Date, edition: string, coverURI: string, status: string, selling: number, lending: number, geolocation: [number, number], images?: Array<string>){
        super(title, authors, isbn, releaseDate, edition, coverURI, bookId)
        this.userBookId = userBookId
        this.userId = userId
        this.status = status
        this.lending = lending
        this.selling = selling
        this.geolocation = geolocation
        this.images = images
    }
}