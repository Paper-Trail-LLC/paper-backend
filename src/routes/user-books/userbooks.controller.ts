import myPool from "../../helpers/mysql.pool"
import {UserBook} from '../../models/userbook'

export class UserBooksController {
    public async searchUserBooks(isbn: string, 
        geolocation?: [number, number], 
        distance?: number,
        status?: string,
        lending?: number, 
        selling?: number,  
        limit: number = 25, 
        page: number = 1): Promise<UserBook[]>{

        return new Promise<UserBook[]>((resolve, reject) => {
            let query = 
            `select * from user_book 
            inner join book on user_book.book_id=book.id 
            where ${isbn.length === 13 ? `isbn13`:`isbn`} = ? 
            ${status ? `and status = ? `:``}
            ${lending ? `and lending = ? `:``}
            ${selling ? `and selling = ? `:``}
            ${geolocation && distance ? `and ST_Distance(Point(?,?), geolocation) <= ? `:``}
            limit ?
            offset ?; 
            select firstname, lastname from author 
            inner join book_author on book_author.author_id = author.id 
            inner join book on book_author.book_id = book.id
            where ${isbn.length === 13 ? `book.isbn13`:`book.isbn`} = ?;`

            let v = []
            v.push(isbn)
            if(status) v.push(status)
            if(lending) v.push(lending)
            if(selling) v.push(selling)
            if(geolocation && distance){
                v.push(geolocation[0])
                v.push(geolocation[1])
                v.push(distance)
            }
            v.push(limit)
            v.push(limit*(page-1))
            v.push(isbn)

            myPool.query({
                sql: query,
                values: v
                } , (error, results: Array<Array<any>>) => {
                if(error){
                    reject(error)
                }
                const authors = results[1].map<string>((value) => {
                    return `${value['firstname']} ${value['lastname']}`
                })
                const userBooks: UserBook[] = results[0].map<UserBook>((value): UserBook => {
                    return new UserBook(
                        value['id'],
                        value['user_id'],
                        value['book_id'], 
                        value['title'], 
                        authors, //List of authors
                        value['isbn13'], 
                        value['release_date'], 
                        value['edition'], 
                        value['image_url'], 
                        value['status'], 
                        value['selling'], 
                        value['lending'], 
                        value['geolocation'])
                })

                resolve(userBooks)
            })
        })
    }
}