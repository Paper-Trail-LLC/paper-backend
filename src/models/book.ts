// WIP
class Book {
    title: string
    authors: string[]
    isbn: string
    releaseDate: Date
    edition: string
    coverURI: string

    constructor(title: string, authors: string[], isbn: string, releaseDate: Date, edition: string, coverURI: string){
        this.title = title
        this.authors = authors
        this.isbn = isbn
        this.releaseDate = releaseDate
        this.edition = edition
        this.coverURI = coverURI
    }
    
}

export default Book