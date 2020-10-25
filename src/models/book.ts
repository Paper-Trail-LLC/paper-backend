// WIP
export class Book {
    bookId?: string
    synopsys?: string
    title: string
    authors: string[]
    isbn: string
    isbn13: string 
    releaseDate: Date
    edition: string
    coverURI: string

    constructor(title: string, authors: string[], isbn: string, isbn13: string, releaseDate: Date, edition: string, coverURI: string, bookId?: string, synopsys?: string){
        this.title = title
        this.authors = authors
        this.isbn = isbn
        this.isbn13 = isbn13
        this.releaseDate = releaseDate
        this.edition = edition
        this.coverURI = coverURI
        this.bookId = bookId
        this.synopsys = synopsys
    }
    
}