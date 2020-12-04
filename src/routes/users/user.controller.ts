import { User } from "../../models/user"
import myPool from "../../helpers/mysql.pool"

export class UserController {

    public getAllUsers = () => {}
    public getUserById = (userId: string) : Promise<User> => {
        return new Promise<User>((resolve, reject) => {
            const query = `SELECT * FROM user WHERE id = ?;`
            myPool.query({
                sql: query,
                values: [userId]
            }, (error, results: User) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(results)
                }
            })
        })
    }
    public createUser = () => {}
    public editUser = () => {}
    public deleteUser = () => {}


    // THESE METHODS ARE USED INSIDE THE BACKEND, NOT ON ROUTES =========================================================
    public updatePassword = (user: User) : Promise<boolean> => {
        return new Promise<boolean>((resolve, reject) => {
            const query = `update user set hash = ? where id = ?;`
            myPool.query({
                sql: query,
                values: [user.hash, user.id]
            }, (error) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(true)
                }
            })
        })
    }
    public getUserByEmail = (email:string) : Promise<User> => {
        return new Promise<User>((resolve, reject) => {
            const query = `SELECT * FROM user WHERE email = ?;`
            myPool.query({
                sql: query,
                values: [email]
            }, (error, results: User) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(results)
                }
            })
        })
    }

    public getUserRoles = async (userId:string) : Promise<Array<string>> => {
        return new Promise<Array<string>>((resolve, reject) => {
            const query = `SELECT role.name from user_role AS ur
            LEFT JOIN role ON ur.role_id = role.id
            WHERE ur.user_id = ?;`
            myPool.query({
                sql: query,
                values: [userId]
            }, (error, results: Array<string>) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(results)
                }
            })
        })
    }
}