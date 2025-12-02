import mysql from "mysql2/promise";

const db = await mysql.createPool({
    host: "localhost",
    user: "root",
    password: "3101",
    database: "ashezdb",
});

export default db;
