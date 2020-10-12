import {Book} from './book'

export class UserBook extends Book {
    status: string
    selling: number
    lending: number
    geolocation: [number, number]
    distance: number | undefined

    constructor(title: string, authors: string[], isbn: string, releaseDate: Date, edition: string, coverURI: string, status: string, selling: number, lending: number, geolocation: [number, number]){
        super(title, authors, isbn, releaseDate, edition, coverURI)
        this.status = status
        this.lending = lending
        this.selling = selling
        this.geolocation = geolocation
    }
}