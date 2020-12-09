// WIP
import { debug } from "console";
import * as mysql from "mysql";

let myPool: mysql.Pool;
let config: mysql.PoolConfig;
console.log(process.env.db_host);
console.log(process.env.db_user);
console.log(process.env.db_password);
console.log(process.env.db_database);
let conns = `mysql://${process.env.db_user}:${process.env.db_password}@${process.env.db_host}/${process.env.db_database}?multipleStatements=true`;

myPool = mysql.createPool({
    host: process.env.db_host,
    user: process.env.db_user,
    password: process.env.db_password,
    database: process.env.db_database,
    multipleStatements: true,
    ssl: 'Amazon RDS'
})
// myPool = mysql.createPool(conns);
console.log(myPool.config);
export default myPool;

// host: process.env.db_host || "127.0.0.1",
// user: process.env.db_user || "dev_user",
// password: process.env.db_password || "secretpassword",
// database: process.env.db_database || "papertrail_dev",
// multipleStatements: true