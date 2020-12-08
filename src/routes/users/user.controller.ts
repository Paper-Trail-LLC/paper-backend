import { User } from "../../models/user"
import { Role } from "../../models/role"
import myPool from "../../helpers/mysql.pool"
import { Request, Response } from "express";

export class UserController {

    public async getAllUsers(): Promise<any> {
        //Get users from database
        // We don't want to send passwords in the response
        return new Promise<any>((resolve, reject) => {
            const query = `SELECT BIN_TO_UUID(user.id) AS id, firstname, lastname, email, role.name AS role FROM user
            LEFT JOIN user_role ON user_role.user_id = user.id
            LEFT JOIN role ON role.id = user_role.role_id
            GROUP BY user.id, role.name;`
            myPool.query({
                sql: query
            }, (error, results: User) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(results)
                }
            })
        })
    };

    /**
     *
     *
     * @param {string} userId
     * @param {boolean} [allInfo=false] whether to return all user information on the table
     * @returns {Promise<any>}
     * @memberof UserController
     */
    public async getUserById(userId: string, allInfo: boolean = false): Promise<any> {
        return new Promise<User>((resolve, reject) => {
            // TODO: Eliminate password from response
            let query: string;
            if (allInfo) {
                query = `SELECT BIN_TO_UUID(user.id) AS id, user.email, user.firstname, user.lastname, user.hash ,user.salt,
            user.gender, user.gender, ST_AsText(user.geolocation) AS geolocation, user.created_on, user.updated_on ,role.name AS role FROM user 
            LEFT JOIN user_role ON user_role.user_id = user.id
            LEFT JOIN role ON role.id = user_role.role_id
            WHERE user.id = UUID_TO_BIN(?)
            GROUP BY user.id, role.name;`
            }
            else {
                query = `SELECT BIN_TO_UUID(user.id) AS id, firstname, lastname, email, gender, ST_AsText(geolocation) AS geolocation, role.name AS role FROM user 
            LEFT JOIN user_role ON user_role.user_id = user.id
            LEFT JOIN role ON role.id = user_role.role_id
            WHERE user.id = UUID_TO_BIN(?)
            GROUP BY user.id, role.name;`
            }
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
    public async createUser(user: User): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            // TODO: Eliminate password from response
            const query = `SET @userId = uuid();
            SET @g = ST_GeomFromText(?);
            INSERT INTO user(id, firstname, lastname, email, gender, hash, salt, geolocation)  
            VALUES(uuid_to_bin(@userId), ?, ?, ?, ?, ?, ?, @g);
            INSERT INTO user_role(user_id, role_id, assigned_by)
            VALUES(uuid_to_bin(@userId), (SELECT id FROM role WHERE name=?),uuid_to_bin(@userId)); 
            SELECT @userId;`
            myPool.query({
                sql: query,
                values: [`POINT(${user.geolocation[0]} ${user.geolocation[1]})`, user.firstname, user.lastname, user.email, user.gender, user.hash, user.salt, user.roles[0].name]
            }, (error, results: string) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(results)
                }
            })
        })
    }

    public async editUser(user: User): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // TODO: Eliminate password from response
            const query = `SET @g = ST_GeomFromText(?);
            UPDATE user
            SET firstname=?, lastname=?, email=?, gender=?, geolocation=@g 
            WHERE id = uuid_to_bin(?);`
            myPool.query({
                sql: query,
                values: [`POINT(${user.geolocation[0]} ${user.geolocation[1]})`, user.firstname, user.lastname, user.email, user.gender, user.id]
            }, (error) => {
                if (error) {
                    reject(error)
                } else {
                    resolve()
                }
            })
        })
    }

    public async deleteUser(userId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // TODO: Eliminate password from response
            const query = `UPDATE user
            SET email='' 
            WHERE id = uuid_to_bin(?);`
            myPool.query({
                sql: query,
                values: [userId]
            }, (error) => {
                if (error) {
                    reject(error)
                } else {
                    resolve()
                }
            })
        })
    }

    // THESE METHODS ARE USED INSIDE THE BACKEND, NOT ON ROUTES =========================================================
    public async updatePassword(user: User): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const query = `UPDATE user SET hash = ? WHERE id = UUID_TO_BIN(?);`
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
    public async getUserByEmail(email: string): Promise<User> {
        return new Promise<User>((resolve, reject) => {
            const query = `SELECT BIN_TO_UUID(user.id) AS id, user.email, user.firstname, user.lastname, user.hash ,user.salt,
            user.gender, ST_AsText(user.geolocation) AS geolocation, user.created_on, user.updated_on ,role.name AS role FROM user 
            LEFT JOIN user_role ON user_role.user_id = user.id
            LEFT JOIN role ON role.id = user_role.role_id
            WHERE email = ?
            GROUP BY user.id, role.name;`
            myPool.query({
                sql: query,
                values: [email]
            }, (error, results: User[]) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(results[0])
                }
            })
        })
    }

    public async getUserRoles(userId: string): Promise<Array<Role>> {
        return new Promise<Array<Role>>((resolve, reject) => {
            const query = `SELECT role.name from user_role AS ur
            LEFT JOIN role ON ur.role_id = role.id
            WHERE ur.user_id = UUID_TO_BIN(?);`
            myPool.query({
                sql: query,
                values: [userId]
            }, (error, results: Array<Role>) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(results)
                }
            })
        })
    }
    
    public async removeUserRole(userId: string, role_name:string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const query = `DELETE FROM user_role
            WHERE user_id = ? AND  role_id = (SELECT id FROM role WHERE name=?);`
            myPool.query({
                sql: query,
                values: [userId, role_name]
            }, (error) => {
                if (error) {
                    reject(error)
                } else {
                    resolve()
                }
            })
        })
    }

    public async assignUserRole(userId: string, role_name:string, asignee:string=userId): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const query = `INSERT INTO user_role(user_id, role_id, assigned_by)
            VALUES(uuid_to_bin(?), (SELECT id FROM role WHERE name=?),uuid_to_bin(?));`
            myPool.query({
                sql: query,
                values: [userId, role_name, asignee]
            }, (error) => {
                if (error) {
                    reject(error)
                } else {
                    resolve()
                }
            })
        })
    }
}   