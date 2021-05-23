const mysql = require("mysql2");
const inquirer = require("inquirer");

// connect to database
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "furyroad1",
    database: ""
},
console.log("connected to the employee database")
);

module.exports = db;