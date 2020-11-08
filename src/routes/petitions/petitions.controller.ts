import { BookPetition } from "../../models/petition";
import myPool from "../../helpers/mysql.pool"

export class PetitionsController {

    public async searchPetitions(expired: boolean, status?: string, lending?: number, selling?: number, currentLocation?: [number, number], searchRadius?: number, page: number = 1, limit: number = 25): Promise<BookPetition[]> {
        return new Promise<BookPetition[]>((resolve, reject) => {
            const query = `select * from book_petition 
            where expiration_date ${expired? '<':'>'} now() 
            ${status? 'and status = ? ':''}
            ${lending != undefined? 'and lending = ? ':''}
            ${selling != undefined? 'and selling = ? ':''}
            ${currentLocation? 'and ST_Distance(Point(?, ?), geolocation) <= ? and (location_radius is null or (ST_Distance(Point(?, ?), geolocation) <= location_radius) ':'and location_radius is null '}
            limit ? 
            offset ?;`

            const v = []
            if(status) v.push(status)
            if(lending != undefined) v.push(lending)
            if(selling != undefined) v.push(selling)
            if(currentLocation) {
                v.push(currentLocation[0])
                v.push(currentLocation[1])
                v.push(searchRadius)
                v.push(currentLocation[0])
                v.push(currentLocation[1])
            }
            v.push(limit)
            v.push(limit*(page-1))

            myPool.query({
                sql: query,
                values: v
            }, (error, results: Array<any>) => {
                if(error){
                    reject(error)
                } else {
                    const bookPetitions: BookPetition[] = results.map<BookPetition>((value) => {
                        return new BookPetition(
                            value['book_id'],
                            value['user_id'],
                            value['description'],
                            value['lending'],
                            value['selling'],
                            value['status'], 
                            [value['geolocation'].x, value['geolocation'].y],
                            value['location_radius'],
                            value['expiration_date'],
                            value['created_on']
                        )
                    })
                    resolve(bookPetitions)
                }
            })
        })
    }

    public async getPetitionById(petitionId: string): Promise<BookPetition> {
        return new Promise<BookPetition>((resolve, reject) => {
            const query = `select * from book_petition 
            where id = ?;`

            myPool.query({
                sql: query,
                values: [petitionId]
            }, (error, results: Array<any>) => {
                if(error){
                    reject(error)
                } else {
                    const bookPetitions: BookPetition[] = results.map<BookPetition>((value) => {
                        return new BookPetition(
                            value['book_id'],
                            value['user_id'],
                            value['description'],
                            value['lending'],
                            value['selling'],
                            value['status'], 
                            [value['geolocation'].x, value['geolocation'].y],
                            value['location_radius'],
                            value['expiration_date'],
                            value['created_on']
                        )
                    })
                    resolve(bookPetitions[0])
                }
            })
        })
    }

    public async getPetitionsByUser(userId: string, expired: boolean, status?: string, lending?: number, selling?: number, page: number = 1, limit: number = 25): Promise<BookPetition[]> {
        return new Promise<BookPetition[]>((resolve, reject) => {
            const query = `select * from book_petition 
            where user_id = ? 
            and expiration_date ${expired? '<':'>'} now() 
            ${status? 'and status = ? ':''}
            ${lending != undefined? 'and lending = ? ':''}
            ${selling != undefined? 'and selling = ? ':''}
            limit ? 
            offset ?;`

            const v = []
            v.push(userId)
            if(status) v.push(status)
            if(lending != undefined) v.push(lending)
            if(selling != undefined) v.push(selling)
            v.push(limit)
            v.push(limit*(page-1))

            myPool.query({
                sql: query,
                values: v
            }, (error, results: Array<any>) => {
                if(error){
                    reject(error)
                } else {
                    const bookPetitions: BookPetition[] = results.map<BookPetition>((value) => {
                        return new BookPetition(
                            value['book_id'],
                            value['user_id'],
                            value['description'],
                            value['lending'],
                            value['selling'],
                            value['status'], 
                            [value['geolocation'].x, value['geolocation'].y],
                            value['location_radius'],
                            value['expiration_date'],
                            value['created_on']
                        )
                    })
                    resolve(bookPetitions)
                }
            })
        })
    }

    public async insertBookPetition(userId: string, bookId: string, status: string, description: string, lending: number, selling: number, geolocation: [number, number], locationRadius: number, expirationDate: Date): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let query = `set @petitionId = uuid_to_bin(uuid()); 
            insert into book_petition (user_id, book_id, status, description, lending, selling, geolocation, location_radius, expiration_date) 
            values (?, ?, ?, ?, ?, ?, ST_GeomFromText('Point(? ?)'), ?, ?); 
            select @petitionId;`

            myPool.query({
                sql: query,
                values: [userId, bookId, status, description, lending, selling, geolocation[0], geolocation[1], locationRadius, expirationDate]
            }, (error, results: Array<Array<any>>) => {
                if(error){
                    reject(error)
                } else {
                    resolve(results[2][0]['@petitionId'])
                }
            })
        })
    }

    public async updateBookPetition(petitionId: string, status?: string, description?: string, lending?: number, selling?: number, geolocation?: [number, number], locationRadius?: number, expirationDate?: Date): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            let query = `update book_petition set 
            ${status? 'status = ? ':''}
            ${description? 'description = ? ':''}
            ${lending != undefined? 'lending = ? ':''}
            ${selling != undefined? 'selling = ? ':''}
            ${geolocation? `geolocation = ST_GeomFromText('Point(? ?)') `:''}
            ${locationRadius? 'location_radius = ? ':''}
            ${expirationDate? 'expiration_date = ? ':''}
            where id = ?;`
            
            const v = []
            if(status) v.push(status)
            if(description) v.push(description)
            if(lending != undefined) v.push(lending)
            if(selling != undefined) v.push(selling)
            if(geolocation) {
                v.push(geolocation[0])
                v.push(geolocation[1])
            }
            if(locationRadius) v.push(locationRadius)
            if(expirationDate) v.push(expirationDate)
            v.push(petitionId)

            myPool.query({
                sql: query,
                values: v
            }, (error, results) => {
                if(error){
                    reject(error)
                } else {
                    if(results.affectedRows == 0){
                        resolve(false)
                    } else {
                        resolve(true)
                    }
                }
            })
        })
    }
}