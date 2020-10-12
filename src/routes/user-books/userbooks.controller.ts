import myPool from "../../helpers/mysql.pool"
import {PoolConnection} from "mysql"
import {UserBook} from '../../models/userbook'

export class UserBooksController {
    public async searchUserBooks(isbn: string, status: string | undefined, lending: number | undefined, selling: number | undefined, geolocation: [number, number] | undefined, distance: number | undefined, limit: number = 25, page: number = 1): Promise<UserBook[]>{
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
            offset ?`

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

            myPool.query({
                sql: query,
                values: v
                } , (error, results: Array<any>, fields) => {
                if(error){
                    reject(error)
                }
                console.log(results)
                resolve([])
                // const userBooks = results.map<UserBook>(item => {

                // })
                
            })
        })
    }
}