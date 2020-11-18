// WIP
export class Book {
    bookId?: string
    synopsis?: string
    title: string
    authors: string[]
    isbn: string
    isbn13: string 
    releaseDate: Date
    edition: string
    coverURI: string

    constructor(title: string, authors: string[], isbn: string, isbn13: string, releaseDate: Date, edition: string, coverURI: string, bookId?: string, synopsis?: string){
        this.title = title
        this.authors = authors
        this.isbn = isbn
        this.isbn13 = isbn13
        this.releaseDate = releaseDate
        this.edition = edition
        this.coverURI = coverURI
        this.bookId = bookId
        this.synopsis = synopsis
    }
    
}