import {UserBooksController} from './userbooks.controller'
// import server from '../../index'
import myPool from '../../helpers/mysql.pool'
// import request from 'supertest'

const userBooksController = new UserBooksController()
// const app = request(server)

describe('userbook routes tests', () => {
    describe('userbook library enpoint', () => {
        it('Should return status code 200 for correct query', () => {
            
        })
    })
})

describe('UserBooksController tests', () => {
    let userIds: string[] = []
    let bookIds: string[] = []
    let userBookIds: string[] = []
    beforeEach(async () => {
        userIds = []
        bookIds = []
        userBookIds = []
        return new Promise<any> ((resolve, reject) => {
            myPool.query({
                sql: `set @a = uuid_to_bin(uuid()); set @b = uuid_to_bin(uuid()); set @c = uuid_to_bin(uuid()); set @d = uuid_to_bin(uuid()); set @e = uuid_to_bin(uuid());
                insert into user (id, email, hash, salt, geolocation) values 
                (@a, ?, ?, ?, ST_GeomFromText('Point(? ?)')),
                (@b, ?, ?, ?, ST_GeomFromText('Point(? ?)')),
                (@c, ?, ?, ?, ST_GeomFromText('Point(? ?)')),
                (@d, ?, ?, ?, ST_GeomFromText('Point(? ?)')),
                (@e, ?, ?, ?, ST_GeomFromText('Point(? ?)'));
                select @a, @b, @c, @d, @e;`,
                values: ['email1@test.org', 'od87vst', 'v8dstdv', 10, 10,
                        'email2@test.org', 'od87vst', 'v8dstdv', 10, 10,
                        'email3@test.org', 'od87vst', 'v8dstdv', 10, 10,
                        'email4@test.org', 'od87vst', 'v8dstdv', 10, 10,
                        'email5@test.org', 'od87vst', 'v8dstdv', 10, 10]
            }, (error, results) => {
                if(error){
                    reject(error.message)
                } else {
                    resolve(results[6])
                }
            })
        }).then(async (userIds) => {
            return new Promise<any> ((resolve, reject) => {
                myPool.query({
                    sql: `set @a = uuid_to_bin(uuid()); set @b = uuid_to_bin(uuid()); 
                    insert into book (id, title, isbn13) values 
                    (@a, ?, ?),
                    (@b, ?, ?); 
                    select @a, @b, @c;`,
                    values: ['Cirque du Freak: A Living Nightmare', '9780316605106',
                            'The Red Pyramid (The Kane Chronicles, Book 1)', '9781410425362']
                }, (error, results) => {
                    if(error){
                        reject(error.message)
                    } else {
                        resolve({
                            userIds,
                            bookIds: results[3]
                        })
                    }
                })
            })
        }).then(async (ids) => {
            return new Promise<any> ((resolve, reject) => {
                myPool.query({
                    sql: `set @a = uuid_to_bin(uuid()); set @b = uuid_to_bin(uuid()); set @c = uuid_to_bin(uuid()); set @d = uuid_to_bin(uuid()); set @e = uuid_to_bin(uuid()); 
                    insert into user_book (id, user_id, book_id, status, lending, selling, geolocation) values 
                    (@a, ?, ?, ?, ?, ?, ST_GeomFromText('Point(? ?)')),
                    (@b, ?, ?, ?, ?, ?, ST_GeomFromText('Point(? ?)')),
                    (@c, ?, ?, ?, ?, ?, ST_GeomFromText('Point(? ?)')),
                    (@d, ?, ?, ?, ?, ?, ST_GeomFromText('Point(? ?)')),
                    (@e, ?, ?, ?, ?, ?, ST_GeomFromText('Point(? ?)')); 
                    select @a, @b, @c, @d, @e;`,
                    values: [ids.userIds[0]['@a'], ids.bookIds[0]['@a'], 'available', 1, 0, -65.926772, 18.376310, 
                            ids.userIds[0]['@a'], ids.bookIds[0]['@b'], 'unavailable', 1, 1, -65.899706, 18.374507,
                            ids.userIds[0]['@b'], ids.bookIds[0]['@b'], 'available', 0, 1, -65.958450, 18.377507,
                            ids.userIds[0]['@a'], ids.bookIds[0]['@b'], 'unavailable', 0, 0, -65.846012, 18.404668,
                            ids.userIds[0]['@c'], ids.bookIds[0]['@a'], 'available', 1, 0, -65.931912, 18.373311]
                }, (error, results) => {
                    if(error){
                        reject(error.message)
                    } else {
                        for(const [_, value] of Object.entries(ids.userIds[0])){
                            userIds.push(value as string)
                        }
                        for(const [_, value] of Object.entries(ids.bookIds[0])){
                            bookIds.push(value as string)
                        }
                        for(const [_, value] of Object.entries(results[6][0])){
                            userBookIds.push(value as string)
                        }
                        resolve(true)
                    }
                })
            })
        })
    })

    afterEach(async () => {
        return new Promise<any>((resolve, reject) => {
            myPool.query({
                sql: `delete from user_book; delete from book_author; delete from author; delete from book; delete from user;`
            }, (error) => {
                if(error){
                    reject(error.message)
                } else {
                    resolve(true)
                }
            })
        })
    })

    afterAll(() => {
        myPool.end()
    })

    describe('searchUserBooks', () => {

        it('should return the correct number of results', async () => {
            const result1 = await userBooksController.searchUserBooks('9780316605106')
            expect(result1).toHaveLength(2)
            const result2 = await userBooksController.searchUserBooks('9780316605106', undefined, undefined, undefined, undefined, undefined, 1, 1)
            expect(result2).toHaveLength(1)
        })

        it('should return results within the correct distance', async () => {
            const result = await userBooksController.searchUserBooks('9780316605106', [-65.925475, 18.370511], 0)
            expect(result).toHaveLength(0)
        })

        it('should return results marked as available', async () => {
            const result1 = await userBooksController.searchUserBooks('9780316605106', undefined, undefined, 'available')
            result1.forEach(value => {
                expect(value.status).toEqual('available')
            })
            const result2 = await userBooksController.searchUserBooks('9781410425362', undefined, undefined, 'available')
            result2.forEach(value => {
                expect(value.status).toEqual('available')
            })
        })

        it('should return lending exclusive books', async () => {
            const result1 = await userBooksController.searchUserBooks('9780316605106', undefined, undefined, undefined, 1, 0)
            result1.forEach(value => {
                expect(value.selling).toEqual(0)
                expect(value.lending).toEqual(1)
            })
            const result2 = await userBooksController.searchUserBooks('9781410425362', undefined, undefined, undefined, 1, 0)
            result2.forEach(value => {
                expect(value.selling).toEqual(0)
                expect(value.lending).toEqual(1)
            })
        })

        it('should return selling exclusive books', async () => {
            const result1 = await userBooksController.searchUserBooks('9780316605106', undefined, undefined, undefined, 0, 1)
            result1.forEach(value => {
                expect(value.selling).toEqual(1)
                expect(value.lending).toEqual(0)
            })
            const result2 = await userBooksController.searchUserBooks('9781410425362', undefined, undefined, undefined, 0, 1)
            result2.forEach(value => {
                expect(value.selling).toEqual(1)
                expect(value.lending).toEqual(0)
            })
        })

        it('should return only results for the given isbn', async () => {
            const result = await userBooksController.searchUserBooks('9781410425362')
            expect(result).toHaveLength(3)
            result.forEach(value => {
                expect(value.isbn13).toBe('9781410425362')
            })
        })

    })

    describe('getLibraryOfUser', () => {
        it('should return userbooks owned by user with given id', async() => {
            for(let id in userIds){
                const results = await userBooksController.getLibraryOfUser(id)
                results.forEach(userBook => {
                    expect(userBook.userId).toEqual(id) 
                })
            }
        })

        it('should return no more results than the limit', async () => {
            for(let id in userIds){
                const results = await userBooksController.getLibraryOfUser(id, 1)
                expect(results.length).toBeLessThanOrEqual(1)
            }
        })
    })

    describe('addBookToLibrary', () => {
        it('should insert userBook', async (done) => {
            const userBookId = await userBooksController.addBookToLibrary(userIds[0], 'available', 1, 1, [1.83, 2.44], '9780440240730')
            myPool.query({
                sql: `select * from user_book where id = ?;`,
                values: [userBookId]
            }, (error, results) => {
                expect(!error).toBeTruthy()
                expect(results[0]['id']).toEqual(userBookId)
                done()
            })
        })

        it('should throw error on invalid user id', async () => {
            try{
                await userBooksController.addBookToLibrary('7727rf2fh923h', 'available', 1, 1, [1.83, 2.44], '9780440240730')
            } catch(error){
                expect(error).toBeTruthy()
            }
        })
    })
})