const mysql = require("mysql2");
const inquirer = require("inquirer");
// const cTable = require("console.table");
require("console.table");


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