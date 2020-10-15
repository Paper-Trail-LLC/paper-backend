// WIP
export class Book {
    bookId?: string
    title: string
    authors: string[]
    isbn: string
    releaseDate: Date
    edition: string
    coverURI: string

    constructor(title: string, authors: string[], isbn: string, releaseDate: Date, edition: string, coverURI: string, bookId?: string){
        this.title = title
        this.authors = authors
        this.isbn = isbn
        this.releaseDate = releaseDate
        this.edition = edition
        this.coverURI = coverURI
        this.bookId = bookId
    }
    
}