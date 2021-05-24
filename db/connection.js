const mysql = require("mysql2");
const inquirer = require("inquirer");
const cTable = require("console.table");

// not sure about this
// class Database {
//     constructor(config) {
//         this.connection = mysql.createConnection(config);
//     }
//     query(sql, args =[] ) {
//         return new Promise((resolve, reject) => {
//             this.connection.query(sql, args, (err, rows) => {
//                 if (err)
//                     return reject(err);
//                 resolve(rows);
//             });
//         });
//     }
//     close() {
//         return new Promise((resolve, reject) => {
//             this.connection.end(err => {
//                 if (err)
//                     return reject(err);
//                 resolve();
//             });
//         });
//     }
// }

// connect to database
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "furyroad1",
    database: "employees"
},
console.log("connected to the employee database")
);

module.exports = db;