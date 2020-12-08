import { MeetingAgreement } from "../../models/meetingAgreement"
import { Pool, PoolConnection } from "mysql"
import myPool from "../../helpers/mysql.pool"
import { PurchaseAgreement } from "../../models/purchaseAgreement"
import { BorrowAgreement } from "../../models/borrowAgreement"

export class AgreementsController {

    public async getMeetingAgreementById(agreementId: string): Promise<MeetingAgreement>{
        return new Promise<MeetingAgreement>((resolve, reject) => {
            const query = `select *, bin_to_uuid(user_book_id) as full_user_book_id, bin_to_uuid(user_id) as full_user_id, m.updated_on as updated from agreement as a inner join meeting_agreement as m on a.id = m.agreement_id where a.id = ?;`
    
            myPool.query({
                sql: query,
                values: [agreementId]
            }, (error, result: Array<any>) => {
                if(error){
                    reject(error)
                } else {
                    resolve(new MeetingAgreement(
                        result[0]['full_user_book_id'],
                        result[0]['full_user_id'],
                        result[0]['status'],
                        result[0]['created_on'],
                        result[0]['updated'],
                        JSON.parse(result[0]['requests']),
                        result[0]['agreement_id'],
                        result[0]['geolocation'],
                        result[0]['place'],
                        result[0]['meeting_date']
                    ))
                }
            })
        })
    }

    public async getPurchaseAgreementById(agreementId: string): Promise<PurchaseAgreement>{
        return new Promise<PurchaseAgreement>((resolve, reject) => {
            const query = `select *, bin_to_uuid(user_book_id) as full_user_book_id, bin_to_uuid(user_id) as full_user_id, m.updated_on as updated from agreement as a inner join purchase_agreement as m on a.id = m.agreement_id where a.id = ?;`
    
            myPool.query({
                sql: query,
                values: [agreementId]
            }, (error, result: Array<any>) => {
                if(error){
                    reject(error)
                } else {
                    resolve(new PurchaseAgreement(
                        result[0]['full_user_book_id'],
                        result[0]['full_user_id'],
                        result[0]['status'],
                        result[0]['created_on'],
                        result[0]['updated'],
                        JSON.parse(result[0]['requests']),
                        result[0]['agreement_id'],
                        result[0]['price']
                    ))
                }
            })
        })
    }

    public async getBorrowAgreementById(agreementId: string): Promise<BorrowAgreement>{
        return new Promise<BorrowAgreement>((resolve, reject) => {
            const query = `select *, bin_to_uuid(user_book_id) as full_user_book_id, bin_to_uuid(user_id) as full_user_id, m.updated_on as updated from agreement as a inner join borrow_agreement as m on a.id = m.agreement_id where a.id = ?;`
    
            myPool.query({
                sql: query,
                values: [agreementId]
            }, (error, result: Array<any>) => {
                if(error){
                    reject(error)
                } else {
                    resolve(new BorrowAgreement(
                        result[0]['full_user_book_id'],
                        result[0]['full_user_id'],
                        result[0]['status'],
                        result[0]['created_on'],
                        result[0]['updated'],
                        JSON.parse(result[0]['requests']),
                        result[0]['agreement_id'],
                        result[0]['return_date']
                    ))
                }
            })
        })
    }

    //PRIORITY
    public async searchMeetingAgreements(userId?: string, userBookId?: string, status?: string, distance?: number, geolocation?: [number, number], hasPassed?: boolean, page: number = 1, limit: number = 25): Promise<MeetingAgreement[]> {
        return new Promise<MeetingAgreement[]>((resolve, reject) => {
            const query = `select *, bin_to_uuid(user_book_id) as full_user_book_id, bin_to_uuid(user_id) as full_user_id, m.updated_on as updated 
            from agreement as a inner join meeting_agreement as m on a.id = m.agreement_id 
            where true 
            ${userId? 'and user_id = uuid_to_bin(?) ':''}
            ${userBookId? 'and user_book_id = uuid_to_bin(?) ':''}
            ${status? 'and status = ? ':''}
            ${hasPassed != undefined? `and meeting_date ${hasPassed? '<':'>'} now() `:''}
            ${distance != undefined && geolocation? `and ST_Distance(ST_GeomFromText('Point(? ?)', 4326), geolocation, 'metre') <= ? `:''}
            limit ? 
            offset ?;`

            const v = []
            if(userId) v.push(userId)
            if(userBookId) v.push(userBookId)
            if(status) v.push(status)
            if(distance != undefined && geolocation){
                v.push(geolocation[0])
                v.push(geolocation[1])
                v.push(distance)
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
                    const meetingAgreements: MeetingAgreement[] = results.map<MeetingAgreement>((value) => {
                        return new MeetingAgreement(
                            value['full_user_book_id'],
                            value['full_user_id'],
                            value['status'],
                            value['created_on'],
                            value['updated'],
                            JSON.parse(value['requests']),
                            value['agreement_id'],
                            value['geolocation'],
                            value['place'],
                            value['meeting_date']
                        )
                    })
                    resolve(meetingAgreements)
                }
            })
        })
    }

    public async searchPurchaseAgreements(userId?: string, userBookId?: string, status?: string, page: number = 1, limit: number = 25): Promise<PurchaseAgreement[]>{
        return new Promise<PurchaseAgreement[]>((resolve, reject) => {
            const query = `select *, bin_to_uuid(user_book_id) as full_user_book_id, bin_to_uuid(user_id) as full_user_id, m.updated_on as updated 
            from agreement as a inner join purchase_agreement as m on a.id = m.agreement_id 
            where true 
            ${userId? 'and user_id = uuid_to_bin(?) ':''}
            ${userBookId? 'and user_book_id = uuid_to_bin(?) ':''}
            ${status? 'and status = ? ':''}
            limit ? 
            offset ?;`

            const v = []
            if(userId) v.push(userId)
            if(userBookId) v.push(userBookId)
            if(status) v.push(status)
            v.push(limit)
            v.push(limit*(page-1))

            myPool.query({
                sql: query,
                values: v
            }, (error, results: Array<any>) => {
                if(error){
                    reject(error)
                } else {
                    const purchaseAgreements: PurchaseAgreement[] = results.map<PurchaseAgreement>((value) => {
                        return new PurchaseAgreement(
                            value['full_user_book_id'],
                            value['full_user_id'],
                            value['status'],
                            value['created_on'],
                            value['updated'],
                            JSON.parse(value['requests']),
                            value['agreement_id'],
                            value['price']
                        )
                    })
                    resolve(purchaseAgreements)
                }
            })
        })
    }

    public async searchBorrowAgreements(userId?: string, userBookId?: string, status?: string, hasPassed?: boolean,  page: number = 1, limit: number = 25): Promise<BorrowAgreement[]>{
        return new Promise<BorrowAgreement[]>((resolve, reject) => {
            const query = `select *, bin_to_uuid(user_book_id) as full_user_book_id, bin_to_uuid(user_id) as full_user_id, m.updated_on as updated 
            from agreement as a inner join borrow_agreement as m on a.id = m.agreement_id 
            where true 
            ${userId? 'and user_id = uuid_to_bin(?) ':''}
            ${userBookId? 'and user_book_id = uuid_to_bin(?) ':''}
            ${status? 'and status = ? ':''}
            ${hasPassed != undefined? `and return_date ${hasPassed? '<':'>'} now() `:''}
            limit ? 
            offset ?;`

            const v = []
            if(userId) v.push(userId)
            if(userBookId) v.push(userBookId)
            if(status) v.push(status)
            v.push(limit)
            v.push(limit*(page-1))

            myPool.query({
                sql: query,
                values: v
            }, (error, results: Array<any>) => {
                if(error){
                    reject(error)
                } else {
                    const borrowAgreement: BorrowAgreement[] = results.map<BorrowAgreement>((value) => {
                        return new BorrowAgreement(
                            value['full_user_book_id'],
                            value['full_user_id'],
                            value['status'],
                            value['created_on'],
                            value['updated'],
                            JSON.parse(value['requests']),
                            value['agreement_id'],
                            value['return_date']
                        )
                    })
                    resolve(borrowAgreement)
                }
            })
        })
    }

    public async createMeetingAgreement(userBookId: string, userId: string, status: string, connection?: PoolConnection){
        return new Promise<string>((resolve, reject) => {
            let p: PoolConnection | Pool = connection? connection: myPool

            const query = `set @id = uuid_to_bin(uuid());
            insert into agreement(id, user_book_id, user_id, status) values (@id, uuid_to_bin(?), uuid_to_bin(?), ?);
            insert into meeting_agreement(agreement_id, requests) values (@id, '[]');
            select bin_to_uuid(@id) as id;`
    
            p.query({
                sql: query,
                values: [userBookId, userId, status]
            }, (error, result: Array<Array<any>>) => {
                if(error){
                    reject(error)
                } else {
                    resolve(result[2][0]['id'])
                }
            })
        })
    }

    public async createPurchaseAgreement(userBookId: string, userId: string, status: string, connection?: PoolConnection){
        return new Promise<string>((resolve, reject) => {
            let p: PoolConnection | Pool = connection? connection: myPool

            const query = `set @id = uuid_to_bin(uuid());
            insert into agreement(id, user_book_id, user_id, status) values (@id, uuid_to_bin(?), uuid_to_bin(?), ?);
            insert into purchase_agreement(agreement_id, requests) values (@id, '[]');
            select bin_to_uuid(@id) as id;`
    
            p.query({
                sql: query,
                values: [userBookId, userId, status]
            }, (error, result: Array<Array<any>>) => {
                if(error){
                    reject(error)
                } else {
                    resolve(result[2][0]['id'])
                }
            })
        })
    }

    public async createBorrowAgreement(userBookId: string, userId: string, status: string, connection?: PoolConnection){
        return new Promise<string>((resolve, reject) => {
            let p: PoolConnection | Pool = connection? connection: myPool

            const query = `set @id = uuid_to_bin(uuid());
            insert into agreement(id, user_book_id, user_id, status) values (@id, uuid_to_bin(?), uuid_to_bin(?), ?);
            insert into borrow_agreement(agreement_id, requests) values (@id, '[]');
            select bin_to_uuid(@id) as id;`
    
            p.query({
                sql: query,
                values: [userBookId, userId, status]
            }, (error, result: Array<Array<any>>) => {
                if(error){
                    reject(error)
                } else {
                    resolve(result[2][0]['id'])
                }
            })
        })
    }

    public async addRequestToMeetingAgreement(userId: string, geolocation: [number, number], place: string, meetingDate: Date, agreementId?: string, userBookId?: string, status?: string): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            let obj = {
                geolocation,
                place,
                meeting_date: meetingDate,
                updated_by: userId
            }
            let json = JSON.stringify(obj)

            if(agreementId) {
                let insertMeetingRequest = `update meeting_agreement set requests = json_array_append(requests, '$', ?) where agreement_id = ?;`

                myPool.query({
                    sql: insertMeetingRequest,
                    values:[json, agreementId]
                }, (error) => {
                    if(error){
                        reject(error)
                    } else {
                        resolve(agreementId)
                    }
                })

            } else if(userBookId && status){
                myPool.getConnection(async (error, connection) => {
                    if(error){
                        reject(error)
                    } else {
                        try{
                            let id = await this.createMeetingAgreement(userBookId, userId, status, connection)
                            let insertRequest = `update meeting_agreement set requests = json_array_append(requests, '$', ?) where agreement_id = ?;`

                            connection.query({
                                sql: insertRequest,
                                values:[json, id]
                            }, (error) => {
                                if(error){
                                    connection.rollback()
                                    reject(error)
                                } else {
                                    connection.commit((error) => {
                                        if(error){
                                            connection.rollback()
                                        } else {
                                            resolve(id)
                                        }
                                    })
                                }
                            })
                        } catch(error){
                            connection.rollback((e) => {
                                if(e){
                                    reject(e)
                                } else {
                                    reject(error)
                                }
                            })
                        }
                    }
                })
            } else {
                reject(new Error('userBookId and status are required if creating an agreement'))
            }
        })
    }

    public async addRequestToPurchaseAgreement(userId: string, price: number, agreementId?: string, userBookId?: string, status?: string): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            let obj = {
                price,
                updated_by: userId
            }
            let json = JSON.stringify(obj)

            if(agreementId) {
                let insertPurchaseRequest = `update purchase_agreement set requests = json_array_append(requests, '$', ?) where agreement_id = ?;`

                myPool.query({
                    sql: insertPurchaseRequest,
                    values:[json, agreementId]
                }, (error) => {
                    if(error){
                        reject(error)
                    } else {
                        resolve(agreementId)
                    }
                })

            } else if(userBookId && status){
                myPool.getConnection(async (error, connection) => {
                    if(error){
                        reject(error)
                    } else {
                        try{
                            let id = await this.createPurchaseAgreement(userBookId, userId, status, connection)
                            let insertRequest = `update purchase_agreement set requests = json_array_append(requests, '$', ?) where agreement_id = ?;`

                            connection.query({
                                sql: insertRequest,
                                values:[json, id]
                            }, (error) => {
                                if(error){
                                    connection.rollback()
                                    reject(error)
                                } else {
                                    connection.commit((error) => {
                                        if(error){
                                            connection.rollback()
                                        } else {
                                            resolve(id)
                                        }
                                    })
                                }
                            })
                        } catch(error){
                            connection.rollback((e) => {
                                if(e){
                                    reject(e)
                                } else {
                                    reject(error)
                                }
                            })
                        }
                    }
                })
            } else {
                reject(new Error('userBookId and status are required if creating an agreement'))
            }
        })
    }

    public async addRequestToBorrowAgreement(userId: string, returnDate: Date, agreementId?: string, userBookId?: string, status?: string): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            let obj = {
                return_date: returnDate,
                updated_by: userId
            }
            let json = JSON.stringify(obj)

            if(agreementId) {
                let insertBorrowRequest = `update borrow_agreement set requests = json_array_append(requests, '$', ?) where agreement_id = ?;`

                myPool.query({
                    sql: insertBorrowRequest,
                    values:[json, agreementId]
                }, (error) => {
                    if(error){
                        reject(error)
                    } else {
                        resolve(agreementId)
                    }
                })

            } else if(userBookId && status){
                myPool.getConnection(async (error, connection) => {
                    if(error){
                        reject(error)
                    } else {
                        try{
                            let id = await this.createMeetingAgreement(userBookId, userId, status, connection)
                            let insertRequest = `update borrow_agreement set requests = json_array_append(requests, '$', ?) where agreement_id = ?;`

                            connection.query({
                                sql: insertRequest,
                                values:[json, id]
                            }, (error) => {
                                if(error){
                                    connection.rollback()
                                    reject(error)
                                } else {
                                    connection.commit((error) => {
                                        if(error){
                                            connection.rollback()
                                        } else {
                                            resolve(id)
                                        }
                                    })
                                }
                            })
                        } catch(error){
                            connection.rollback((e) => {
                                if(e){
                                    reject(e)
                                } else {
                                    reject(error)
                                }
                            })
                        }
                    }
                })
            } else {
                reject(new Error('userBookId and status are required if creating an agreement'))
            }
        })
    }

    public async acceptMeetingAgreement(agreementId: string): Promise<boolean>{
        return new Promise<boolean>(async (resolve, reject) => {
            try{
                let agreement: MeetingAgreement = await this.getMeetingAgreementById(agreementId)

                let finalRequest = agreement.requests[agreement.requests.length-1]

                const query = `update meeting_agreement set geolocation = ST_GeomFromText('Point(? ?)', 4326), place = ?, meeting_date = ? where agreement_id = ?`
        
                myPool.query({
                    sql: query,
                    values: [finalRequest.geolocation[0], finalRequest.geolocation[1], finalRequest.place, finalRequest.meeting_date, agreementId]
                }, (error) => {
                    if(error){
                        reject(error)
                    } else {
                        resolve(true)
                    }
                })
            } catch(error){
                reject(error)
            }
        })
    }

    public async acceptPurchaseAgreement(agreementId: string){
        return new Promise<boolean>(async (resolve, reject) => {
            try{
                let agreement: MeetingAgreement = await this.getMeetingAgreementById(agreementId)

                let finalRequest = agreement.requests[agreement.requests.length-1]

                const query = `update purchase_agreement set price = ? where agreement_id = ?`
        
                myPool.query({
                    sql: query,
                    values: [finalRequest.price, agreementId]
                }, (error) => {
                    if(error){
                        reject(error)
                    } else {
                        resolve(true)
                    }
                })
            } catch(error){
                reject(error)
            }
        })
    }

    public async acceptBorrowAgreement(agreementId: string){
        return new Promise<boolean>(async (resolve, reject) => {
            try{
                let agreement: MeetingAgreement = await this.getMeetingAgreementById(agreementId)

                let finalRequest = agreement.requests[agreement.requests.length-1]

                const query = `update borrow_agreement set return_date where agreement_id = ?`
        
                myPool.query({
                    sql: query,
                    values: [finalRequest.return_date, agreementId]
                }, (error) => {
                    if(error){
                        reject(error)
                    } else {
                        resolve(true)
                    }
                })
            } catch(error){
                reject(error)
            }
        })
    }
}