// WIP
import * as mysql from "mysql";

let myPool: mysql.Pool;
myPool = mysql.createPool({
    host: process.env.db_host || "127.0.0.1",
    user: process.env.db_user || "dev_user",
    password: process.env.db_password || "secretpassword",
    database: process.env.db_database || "papertrail_dev",
    multipleStatements: true
})

export default myPool;