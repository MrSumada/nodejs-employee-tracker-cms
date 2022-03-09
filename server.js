const inquirer = require('inquirer');
const cTable = require('console.table');
const db = require('./db/connection');
const inputCheck = require('./utils/inputCheck');


// Arrays for populating Inquirer choices
let departmentsArray = []
db.query(`SELECT departments.name FROM departments`, (err, rows) => {
    if (err) { console.log(err);} 
    departmentsArray = rows.map(dept => {
        return dept.name;
    });
});

let rolesArray = []
db.query(`SELECT roles.title FROM roles`, (err, rows) => {
    if (err) { console.log(err);} 
    rolesArray = rows.map(roles => {
        return roles.title;
    });
});

let employeesArray = []
db.query(`SELECT concat(employees.first_name,' ',employees.last_name) AS name FROM employees`, (err, rows) => {
    if (err) { console.log(err);} 
    employeesArray = rows.map(people => {
        return people.name;
    });  
    employeesArray.unshift("No Manager");  
});

let uniqueManagersArray = []
db.query(`SELECT DISTINCT concat(self.first_name,' ',self.last_name) AS name 
    FROM employees self 
    INNER JOIN employees managers ON self.id=managers.manager_id`, (err, rows) => {
    if (err) { console.log(err);} 
    uniqueManagersArray = rows.map(managers => {
        return managers.name;
    });
    // console.log(uniqueManagersArray);
    // uniqueManagersArray.unshift("No Manager");    
});


// List of options for "What would you like to do?"
const questions = () => {
    
    console.log(``)
    return inquirer.prompt([
        {
            type: "list",
            name: "view",
            message: "What would you like to do?",
            choices: ["View All Departments", "View All Roles", "View All Employees",
            "View Employees By Manager", "View Employees By Department",
            "Add A Department", "Add A Role", "Add An Employee", "Update An Employee's Manager"]
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
        if (answer.view === "View Employees By Manager") {
            return viewEmployeesByManager();
        }
        if (answer.view === "View Employees By Department") {
            return viewEmployeesByDepartment();
        }
        if (answer.view === "Add A Department"){
            return addDepartment();
        }
        if (answer.view === "Add A Role"){
            return addRole();
        }
        if (answer.view === "Add An Employee") {
            return addEmployee();
        }
        if (answer.view === "Update An Employee's Manager") {
            return updateEmployeeManager();
        }
    })
};

// FUNCTIONS

// Initialize App, call questions
function init() {
    console.log(`
    ====================================================
    Welcome to Your Employee Tracker! Let's Get Started!
    ====================================================
    `);
    return questions();
}

// Ask whether the user would like to continue
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

// Functions corresponding to questions

function viewDepartments() {
    // query department id and name for departments
    db.query(`SELECT departments.id, departments.name AS 'department name' FROM departments`, (err, rows) => {
        if (err) { console.log(err);} 
        console.table(rows);

        return moreQuestions();
    });
}

function viewRoles() {
    // query id, title, salary, and department for roles
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
    // query id, first and last name, role title, salary, department, and manager for employees
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

function viewEmployeesByManager() {
    return inquirer.prompt([
        {
            type: "list",
            name: "manager",
            message: "Who is this employee's manager?",
            choices: uniqueManagersArray
        }
    ])
    .then( response => {

        // query id for corresponding employee names
        db.query(`SELECT employees.id FROM employees WHERE concat(employees.first_name,' ',employees.last_name) = '${response.manager}'`
            ,(err, row)  => {
                if (err) { console.log(err);} 
                const manager_id = row[0].id;

                // query employee names for corresponding manager_id
                db.query(`SELECT concat(employees.first_name,' ',employees.last_name) AS "${response.manager}'s employees" FROM employees WHERE employees.manager_id = '${manager_id}'`
                    , (err, rows) => {
                    if (err) { console.log(err);} 

                    console.log(``)
                    console.table(rows);
                    return moreQuestions();
                })
            })
    })
}

function viewEmployeesByDepartment() {
    return inquirer.prompt([
        {
            type: "list",
            name: "department",
            message: "What is this employee's department?",
            choices: departmentsArray
        }
    ])
    .then( response => {
        // query department_id
        db.query(`SELECT departments.id FROM departments WHERE departments.name = '${response.department}'`
        ,(err, row)  => {
            if (err) { console.log(err);} 
            const department_id = row[0].id;
    
            // query role_ids corresponding to department_id
            db.query(`SELECT roles.id FROM roles WHERE roles.department_id = ${department_id}`
            ,(err, data) => {
                if (err) { console.log(err);} 

                //create input string for WHERE, using array, for loop, push, and join with OR
                const role_ids = [];
                for (let i = 0; i < data.length; i++) {
                    role_ids.push("employees.role_id = " + data[i].id);
                }
                const whereInput = role_ids.join(' OR ');
    
                // query employees based on each corresponding role_id
                db.query(`SELECT concat(employees.first_name,' ',employees.last_name) AS "${response.department} employees"
                FROM employees
                WHERE ${whereInput}`
                    , (err, rows) => {
                    if (err) { console.log(err);} 
        
                    console.log(``)
                    console.table(rows);
                    return moreQuestions();
                })
            })
        })
    })
}

function addDepartment() {
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
        // push into departments array, so future inquirers featuring the department array will be updated
        departmentsArray.push(response.dept_name);
        // add new department into db
        db.query(`INSERT INTO departments (name)
            VALUES ('${response.dept_name}')
            `, (err, row) => {
                viewDepartments();
        })
    })
}

function addRole() {
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
            message: "What is the salary for this role?",
            validate: number => {
                if (!isNaN(parseInt(number))) {
                    return true;
                } else {
                    console.log(`
                    Please enter a number for this salary. Up to two decimals.`);
                    return false;
                }
            }
        },
        {
            type: "list",
            name: "department",
            message: "What is this role's department?",
            choices: departmentsArray
        }
    ])
    .then( response => {

        // push into roles array, so future inquirers featuring the roles array will be updated
        rolesArray.push(response.role_name);
        //query department_id for corresponding department name
        db.query(`SELECT departments.id FROM departments WHERE departments.name = '${response.department}'`, (err, data) => {
            if (err) { console.log(err);} 
            const newDepartment = data[0].id;

            // add new role into the db
            db.query(`INSERT INTO roles (title, salary, department_id)
                VALUES ('${response.role_name}', '${response.salary}', '${newDepartment}')
                `, (err, row) => {
                    if (err) { console.log(err);} 
                    viewRoles();
                }
            )
        })
    })
}

function addEmployee() {

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
            type: "list",
            name: "manager",
            message: "Who is your employee's manager?",
            choices: employeesArray
        },
    ])
    .then( response => {
        const addedEmployee = response.first_name + " " + response.last_name;
        // push into employees array, so future inquirers featuring the employees array will be updated
        employeesArray.push(addedEmployee);

        // check if new employee's manager is in the unique manager array already, if NOT push them to it
        // this will affect future inquirers using the unique manager array
        if (!uniqueManagersArray.includes(response.manager)) {
            uniqueManagersArray.push(response.manager);
        }

        // query id for corresponding roles titles
        db.query(`SELECT roles.id FROM roles WHERE roles.title = '${response.role}'`, (err, data) => {
            if (err) {console.log(err);} 
            const role_id = data[0].id;
            console.log(role_id);

            // if manager is selected
            if (response.manager !== "No Manager") {
                // query manager's id for corresponding name
                db.query(`SELECT employees.id FROM employees WHERE concat(employees.first_name,' ',employees.last_name) = '${response.manager}'`, (err, info) => {
                    if (err) {console.log(err);} 
                    const manager_id = info[0].id;
                    console.log(manager_id);

                    // add employee to the db with manager_id
                    db.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id)
                        VALUES ('${response.first_name}','${response.last_name}', '${role_id}', '${manager_id}')
                        `, (err, row) => {
                            if (err) {console.log(err);} 
                            // console.log(row);
                            viewEmployees();
                    })
                })
            } else {
            // if no manager is selected, add employee to db with manager set to null
            db.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id)
                        VALUES ('${response.first_name}','${response.last_name}', '${role_id}', null)
                        `, (err, row) => {
                            if (err) {console.log(err);} 
                            // console.log(row);
                            viewEmployees();
                    })
            }
        })
    })
}

function updateEmployeeManager() {
    return inquirer.prompt([
        {
            type: "list",
            name: "employee",
            message: "Which employee's would you like to update?",
            choices: employeesArray
        },
        {
            type: "list",
            name: "manager",
            message: "Who is this employee's manager?",
            choices: managersArray
        }
    ])
    .then( response => {

        // query ids for corresponding employee names
        db.query(`SELECT employees.id FROM employees WHERE concat(employees.first_name,' ',employees.last_name) = '${response.employee}'`
            , (err, row) => {
        if (err) { console.log(err);} 
        const employee_id = row[0].id;

            // if manager is selected
            if (response.manager !== "No Manager") {
                // query manager's id from corresponding name
                db.query(`SELECT employees.id FROM employees WHERE concat(employees.first_name,' ',employees.last_name) = '${response.manager}'`, (err, info) => {
                    if (err) {console.log(err);} 
                    const manager_id = info[0].id;

                    // update manager_id for given employee_id
                    db.query(`UPDATE employees SET manager_id = ? WHERE id = ?`, [manager_id, employee_id]
                        , (err, row) => {
                            if (err) {console.log(err);} 
                            
                            viewEmployees();
                    })
                })
            } else {
                // if no manager is selected, set given employee_id to null
                db.query(`UPDATE employees SET manager_id = ? WHERE id = ?`, [null, employee_id]
                        , (err, row) => {
                            if (err) {console.log(err);} 
                            
                            viewEmployees();
                    })
            }
        })
    })
}


// Initialize app
init();