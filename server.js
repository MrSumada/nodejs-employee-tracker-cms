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
            return viewEmployees();
        }
        if (answer.view === "Add A Department"){
            return inquirer.prompt([
                {
                    type: "input",
                    name: "dept_name",
                    message: "What is the name of your company's new department?",
                    validate: name => {
                        if (name) {
                            return true;
                        } else {
                            console.log(`Please enter a name for this role.`);
                            return false;
                        }
                    }
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
        if (answer.view === "Add A Role"){
            const departmentsArray = [];
            const currentDepartments = db.query(`SELECT departments.id, departments.name FROM departments`, (err, rows) => {
                if (err) { console.log(err);} 
                // Turn this into an array, let departments.name be array used in choices i.e. departmentArray
            })
            

            return inquirer.prompt([
                {
                    type: "input",
                    name: "role_name",
                    message: "What is the name of your company's the new role?",
                    validate: name => {
                        if (name) {
                            return true;
                        } else {
                            console.log(`Please enter a name for this role.`);
                            return false;
                        }
                    }
                },
                {
                    type: "input",
                    name: "salary",
                    message: "What is the salary for this new role?",
                    validate: number => {
                        if (typeof parseInt(number) === "number") {
                            return true;
                        } else {
                            console.log(`Please enter a number for this salary. Up to two decimals.`);
                            return false;
                        }
                    }
                },
                {
                    type: "list",
                    name: "department",
                    message: "Which department contains this new role?",
                    choices:departmentsArray,
                    validate: name => {
                        if (name) {
                            return true;
                        } else {
                            console.log(`Please enter a name for this role.`);
                            return false;
                        }
                    }
                }
            ])
            .then( response => {
                const department_id = 2;

                db.query(`INSERT INTO roles (name, salary, department_id)
                VALUES ('${response.dept_name}, ${response.salary}, ${department_id}')
                `, (err, row) => {
                    viewRoles();
                })
            })
        }
        if (answer.view === "Add An Employee") {
            const rolesArray = [];
            const currentRoles = db.query(`SELECT roles.id, roles.title FROM roles`, (err, rows) => {
                if (err) { console.log(err);} 
            })
            const managerArray = [];
            const currentEmployees = db.query(`SELECT employees.id, departments.name AS 'department name' FROM departments`, (err, rows) => {
                if (err) { console.log(err);} 
            })
            return inquirer.prompt([
                {
                    type: "input",
                    name: "first_name",
                    message: "What is your employee's first name?",
                    validate: name => {
                        if (name) {
                            return true;
                        } else {
                            console.log(`Please enter a name for this role.`);
                            return false;
                        }
                    }
                },
                {
                    type: "input",
                    name: "last_name",
                    message: "What is your employee's last name?",
                    validate: name => {
                        if (name) {
                            return true;
                        } else {
                            console.log(`Please enter a name for this role.`);
                            return false;
                        }
                    }
                },
                {
                    type: "list",
                    name: "role",
                    message: "What is your employee's role?",
                    choices: rolesArray
                },
                {
                    type: "confirm",
                    name: "managerConfirm",
                    message: "Does your employee have a manager?",
                },
                {
                    type: "list",
                    name: "role",
                    message: "What is your employee's role?",
                    when: managerConfirm === true,
                    choices: managerArray
                },
            ])
            .then( response => {
                const role_id = 2;
                const manager_id = 1;

                db.query(`INSERT INTO employees (name, salary, role_id, manager_id)
                VALUES ('${response.dept_name}, ${response.salary}, ${role_id}, ${manager_id}')
                `, (err, row) => {
                    viewRoles();
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

function viewEmployees() {
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

init();