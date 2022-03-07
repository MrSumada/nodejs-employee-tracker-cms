const express = require('express');
const inquirer = require('inquirer');
const cTable = require('console.table');
const db = require('./db/connection');
const inputCheck = require('./utils/inputCheck');
const { json } = require('express/lib/response');
// const { viewDepartments } = require('./utils/dbQueries')

const PORT = process.env.PORT || 3001;
const app = express();

// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());
// app.use((req, res) => {
//     res.status(404).end();
// });


db.connect(err => {
    if (err) throw err;
    // console.log('Database connected');
    app.listen(PORT, () => {
        // console.log(`Server running on port ${PORT}`);
    });
});

const questions = () => {
    
    console.log(``)
    return inquirer.prompt([
        {
            type: "list",
            name: "view",
            message: "What would you like to do?",
            choices: ["View All Departments", "View All Roles", "View All Employees", "Add A Department", "Add A Role", "Add An Employee"]
        }
    ])
    .then(answer => {
        
        console.log(``)

        if (answer.view == "View All Departments") {
            return viewDepartments();
        }
        if (answer.view === "View All Roles") {

            return viewRoles();
        }
        if (answer.view === "View All Employees") {

            db.query(`SELECT self.id, self.first_name, self.last_name,
            roles.title, roles.salary, departments.name AS department,
            concat(managers.first_name,' ',managers.last_name) AS manager
            FROM employees self
            LEFT JOIN roles ON self.role_id = roles.id
            LEFT JOIN departments ON roles.department_id = departments.id
            LEFT JOIN employees managers ON managers.id = self.manager_id`
            , (err, rows) => {
                if (err) { console.log(err);} 
                console.table(rows);
                
                return moreQuestions();
            });
        }
        if (answer.view === "Add A Department"){
            console.log(``)
            return inquirer.prompt([
                {
                    type: "input",
                    name: "dept_name",
                    message: "What is the name of the new department you?",
                }
            ])
            .then( response => {
                db.query(`INSERT INTO departments (name)
                VALUES ('${response.dept_name}')
                `, (err, row) => {
                    viewDepartments();
                })
            })
        }
    })
};


function init() {
    console.log(`
    ====================================================
    Welcome to Your Employee Tracker! Let's Get Started!
    ====================================================
    `);
    return questions();
}

function moreQuestions() {
    console.log(``)

    return inquirer.prompt([
        {
            type: "confirm",
            name: "confirm",
            message: "Would you like to continue?",
        }
    ]).then(answer => {
        if (answer.confirm === true){
            return questions();
        } else {
        console.log(`
        Thank you for using Your Employee Tracker!
        `);
        }
    })
}

function viewDepartments() {
    db.query(`SELECT departments.id, departments.name AS 'department name' FROM departments`, (err, rows) => {
        if (err) { console.log(err);} 
        console.table(rows);
        return moreQuestions();
    });
}

function viewRoles() {
    db.query(`
            SELECT roles.id, roles.title, roles.salary, departments.name AS department 
            FROM roles
            LEFT JOIN departments
            ON roles.department_id = departments.id
            `, (err, rows) => {
                if (err) { console.log(err);} 
                console.table(rows);
                
                return moreQuestions();
            });
}

init();