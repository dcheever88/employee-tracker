const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const cTable = require("console.table");
const inquirer = require("inquirer");

const prompts = {
    viewAllEmployees: "View All Employees",
    viewByDepartment: "View all Employees by Department",
    viewByManager: "View all Employees by Manager",
    addEmployee: "Add an Employee",
    removeEmployee: "Remove an Employee",
    updateRole: "Update Employee Role",
    // have to add this
    // updateEmployeeManager: "Update Employee Manager",
    viewAllRoles: "View All Roles",
    exit: "Exit"
};

function prompt() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: [
                prompts.viewAllEmployees,
                prompts.viewByDepartment,
                prompts.viewByManager,
                prompts.viewAllRoles,
                prompts.addEmployee,
                prompts.removeEmployee,
                prompts.updateRole,
                prompts.exit
            ]
        })
        .then(answer => {
            console.log("answer", answer);
            switch (answer.action) {
                case prompts.viewAllEmployees:
                    viewAllEmployees();
                    break;
                case prompts.viewByDepartment:
                    viewByDepartment();
                    break;
                case prompts.viewByManager:
                    viewByManager();
                    break;
                case prompts.addEmployee:
                    addEmployee();
                    break;
                case prompts.removeEmployee:
                    removeEmployee();
                    break;
                case prompts.updateRole:
                    updateRole();
                    break;
                case prompts.viewAllRoles:
                    viewAllRoles();
                    break;
                // case prompts.updateEmployeeManager:
                //     updateEmployeeManager();
                //     break;
                case prompts.exit:
                    connection.end();
                    break;
            }
        });
}

function viewAllEmployees() {
    const sql = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) as manager
    FROM employee
    LEFT JOIN employee manager ON manager.id = employee.manager_id
    INNER JOIN role ON (role.id = employee.role_id)
    INNER JOIN department ON (department.id = role.department_id)
    ORDER BY employee.id;`;
    db.query(sql, (err, res) => {
        if (err) throw err;
        console.log("\n");
        console.log("View All Employees");
        console.log("\n");
        console.table(res);
        prompt();
    });
}

function viewByDepartment() {
    const sql = `SELECT department.name AS department, role.title, employee.id, employee.first_name, employee.last_name
    FROM employee
    LEFT JOIN role ON (role.id = employee.role_id)
    LEFT JOIN department ON (department.id = role.department_id)
    ORDER BY department.name;`;
    db.query(sql, (err, res) => {
        if (err) throw err;
        console.log("\n");
        console.log("View Employees By Department");
        console.log("\n");
        console.table(res);
        prompt();
    });
}

function viewByManager() {
    const sql = `SELECT CONCAT(manager.first_name, " ", manager.last_name) AS manager, department.name AS department, employee.id, employee.first_name, employee.last_name, role.title
        FROM employee
        LEFT JOIN employee manager on manager.id = employee.manager_id
        INNER JOIN role ON (role.id = employee.role_id && employee.manager_id != "NULL")
        INNER JOIN department ON (department.id) = role.department_id)
        ORDER BY manager;`;
        db.query(sql, (err, res) => {
            if (err) throw err;
            console.log("\n");
            console.log("View Employeee By Manager");
            console.log("\n");
            console.table(res);
            prompt();
        });
}

function viewAllRoles() {
    const sql = `SELECT role.title, employee.id, employee.first_name, employee.last_name, department.name AS department
    FROM employee
    LEFT JOIN role ON (role.id = employee.role_id)
    LEFT JOIN department ON (department.id = role.department_id)
    ORDER BY role.title;`;
    db.query(sql, (err, res) => {
        if (err) throw err;
        console.log("\n");
        console.log("View Employee By Role");
        console.log("\n");
        console.table(res);
        prompt();
    });
}

async function addEmployee() {
    const addName = await inquirer.prompt(askName());
    db.query("SELECT role.id, role.title FROM role ORDER BY role.id;", async (err, res) => {
        if (err) throw err;
        const { role } = await inquirer.prompt([
            {
                name: "role",
                type: "list",
                choices: () => res.map(res => res.title),
                message: "Please enter employee Role"
            }
        ]);
        let roleId;
        for (const row of res) {
            if (row.title === role) {
                roleId = row.id;
                continue;
            }
        }
        db.query("SELECT * FROM employee", async (err, res) => {
            if (err) throw err;
            let choices = res.map(res => `${res.first_name} ${res.last_name}`);
            choices.push("none");
            let { manager } = await inquirer.prompt([
                {
                    name: "manager",
                    type: "list",
                    choices: choices,
                    message: "Please enter employee Manager"
                }
            ]);
            let managerId;
            let managerName;
            if (manager === "none") {
                managerId = null;
            } else {
                for (const data of res) {
                    data.fullName = `${data.first_name} ${data.last_name}`;
                    if (data.fullName === manager) {
                        managerId = data.id;
                        managerName = data.fullName;
                        console.log(managerId);
                        console.log(managerName);
                        continue;
                    }
                }
            }
            console.log("Employee has been added. View all employees to verify");
            db.query(
                "INSERT INTO employee SET ?",
                {
                    first_name: addName.first,
                    last_name: addName.last,
                    role_id: roleId,
                    manager_id: parseInt(managerId)
                },
                (err, res) => {
                    if (err) throw err;
                    prompt();
                }
            );
        });
    });
}

function remove(input) {
    const promptQuestion = {
        yes: "yes",
        no: "No I do not (view all employees)"
    };
    inquirer.prompt([
        {
            name: "action",
            type: "list",
            messager: "In order to proceed to employee, an employee ID must be entered. View all employees to get" + " the employee ID. Do you know the employee ID?",
            choices: [promptQuestion.yes, promptQuestion.no]
        }
    ]).then(answer => {
        if (input === "delete" && answer.action === "yes") removeEmployee();
        else if (input === "role" && answer.action === "yes") updateRole();
        else viewAllEmployees();
    });
};

async function removeEmployee() {
    const answer = await inquirer.prompt([
        {
            name: "first",
            type: "input",
            message: "Please enter the employee ID you would like to remove: "
        }
    ]);

    db.query("DELETE FROM employee WHERE ?",
    {
        id: answer.first
    },
    function (err) {
        if (err) throw err;
    }
    )
    console.log("Employee has been removed from the system!");
    prompt();
};

function askId() {
    return ([
        {
            name: "name",
            type: "input",
            message: "Please enter employee ID"
        }
    ]);
}

async function updateRole() {
    const employeeId = await inquirer.prompt(askId());

    db.query("SELECT role.id, role.title FROM role ORDER BY role.id;", async (err, res) => {
        if (err) throw err;
        const { role } = await inquirer.prompt([
            {
                name: "role",
                type: "list",
                choices: () => res.map(res => res.title),
                message: "Please enter new employee Role"
            }
        ]);
        let roleId;
        for (const row of res) {
            if (row.title === role) {
                roleId = row.id;
                continue;
            }
        }
        db.query(`UPDATE employee
        SET role_id = ${roleId}
        WHERE employee.id = ${employeeId.name}`, async (err, res) => {
            if (err) throw err;
            console.log("Role has been updated")
            prompt();
        });
    });
}

function askName() {
    return ([
        {
            name: "first",
            type: "input",
            message: "Please enter first name"
        },
        {
            name: "last",
            type: "input",
            message: "Please enter last name"
        }
    ]);
}