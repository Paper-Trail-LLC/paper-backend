// WIP
import * as mysql from "mysql";

let myPool: mysql.Pool;
myPool = mysql.createPool({
    host: process.env.db_host || "mysql",
    user: process.env.db_user,
    password: process.env.db_password,
    database: process.env.db_database
})

export = myPool;