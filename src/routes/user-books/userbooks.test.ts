import {UserBooksController} from './userbooks.controller'
import myPool from '../../helpers/mysql.pool'

const userBooksController = new UserBooksController()

describe('userbook routes tests', () => {
    describe('userbook search enpoint', () => {

    })
})

describe('UserBooksController tests', () => {
    describe('searchUserBooks', () => {
        beforeAll(async () => {
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
            }).then((userIds) => {
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
            }).then((ids) => {
                return new Promise<any> ((resolve, reject) => {
                    myPool.query({
                        sql: `set @a = uuid_to_bin(uuid()); set @b = uuid_to_bin(uuid()); set @c = uuid_to_bin(uuid()); set @d = uuid_to_bin(uuid()); set @e = uuid_to_bin(uuid()); 
                        insert into user_book (id, user_id, book_id, status, lending, selling, geolocation) values 
                        (@a, ?, ?, ?, ?, ?, ST_GeomFromText('Point(? ?)')),
                        (@b, ?, ?, ?, ?, ?, ST_GeomFromText('Point(? ?)')),
                        (@c, ?, ?, ?, ?, ?, ST_GeomFromText('Point(? ?)')),
                        (@d, ?, ?, ?, ?, ?, ST_GeomFromText('Point(? ?)')),
                        (@e, ?, ?, ?, ?, ?, ST_GeomFromText('Point(? ?)'));`,
                        values: [ids.userIds[0]['@a'], ids.bookIds[0]['@a'], 'available', 1, 0, 10, 10,
                                ids.userIds[0]['@a'], ids.bookIds[0]['@b'], 'unavailable', 1, 1, 10, 10,
                                ids.userIds[0]['@b'], ids.bookIds[0]['@b'], 'available', 0, 1, 10, 10,
                                ids.userIds[0]['@a'], ids.bookIds[0]['@b'], 'unavailable', 0, 0, 10, 10,
                                ids.userIds[0]['@c'], ids.bookIds[0]['@a'], 'available', 1, 0, 10, 10]
                    }, (error) => {
                        if(error){
                            reject(error.message)
                        } else {
                            resolve(true)
                        }
                    })
                })
            })
        })

        afterAll(async () => {
            return new Promise<any>((resolve, reject) => {
                myPool.query({
                    sql: `delete from user_book; delete from book; delete from user;`
                }, (error) => {
                    if(error){
                        reject(error.message)
                    } else {
                        myPool.end()
                        resolve(true)
                    }
                })
            })
        })

        it('should return the correct number of results', async () => {
            const result = await userBooksController.searchUserBooks('9780316605106')
            expect(result).toHaveLength(2)
        })

        it('should return results within the correct distance', () => {

        })

        it('should return results marked as available', () => {

        })

        it('should return lending exclusive books', async () => {

        })

        it('should return selling exclusive books', async () => {

        })

        it('should return only results for the given isbn', async () => {
            const result = await userBooksController.searchUserBooks('9781410425362')
            expect(result).toHaveLength(3)
            result.forEach(value => {
                console.log(value)
                expect(value.isbn).toBe('9781410425362')
            })
        })

    })
})