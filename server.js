const inquirer = require('inquirer');
const cTable = require('console.table');
const db = require('./db/connection');

// Arrays ued for populating Inquirer choices
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
});

// this array is for Manager selections where we only want to include employees listed as managers, and only add them once each
let uniqueManagersArray = []
db.query(`SELECT DISTINCT concat(self.first_name,' ',self.last_name) AS name 
    FROM employees self 
    INNER JOIN employees managers ON self.id=managers.manager_id`, (err, rows) => {
    if (err) { console.log(err);} 
    uniqueManagersArray = rows.map(managers => {
        return managers.name;
    }); 
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
            "Add A Department", "Add A Role", "Add An Employee",
            "Update An Employee's Role", "Update An Employee's Manager", "Update A Role's Salary",
            "Delete A Department", "Delete A Role", "Delete An Employee", "View Utilized Department Budget"]
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
        if (answer.view === "Update An Employee's Role") {
            return updateEmployeeRole();
        }
        if (answer.view === "Update An Employee's Manager") {
            return updateEmployeeManager();
        }
        if (answer.view === "Update A Role's Salary") {
            return updateRoleSalary();
        }
        if (answer.view === "Delete A Department") {
            return deleteDepartment();
        }
        if (answer.view === "Delete A Role") {
            return deleteRole();
        }
        if (answer.view === "Delete An Employee") {
            return deleteEmployee();
        }
        if (answer.view === "View Utilized Department Budget") {
            return viewUtilizedBudget();
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
        `)
        
        process.exit();
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

    // Add No Manager option to inquirer choices
    employeesArray.unshift("No Manager"); 

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

        // remove no manager option from employees array
        employeesArray.splice(0, 1);
        // push into employees array, so future inquirers featuring the employees array will be updated
        employeesArray.push(addedEmployee);

        // check if new employee's manager is in the unique manager array already, if NOT push them to it
        // this will affect future inquirers using the unique manager array
        if (!uniqueManagersArray.includes(response.manager) && response.manager !== "No Manager") {
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

function updateEmployeeRole() {

    return inquirer.prompt([
        {
            type: "list",
            name: "employee",
            message: "Which employee's would you like to update?",
            choices: employeesArray
        },
        {
            type: "list",
            name: "role",
            message: "What is this employee's new role?",
            choices: rolesArray
        }
    ])
    .then( response => {

        // query ids for corresponding employee names
        db.query(`SELECT employees.id FROM employees WHERE concat(employees.first_name,' ',employees.last_name) = '${response.employee}'`
            , (err, row) => {
        if (err) { console.log(err);} 
        const employee_id = row[0].id;

        // query role's id from corresponding title
        db.query(`SELECT roles.id FROM roles WHERE roles.title = '${response.role}'`, (err, info) => {
            if (err) {console.log(err);} 
            const role_id = info[0].id;

            // update manager_id for given employee_id
            db.query(`UPDATE employees SET role_id = ? WHERE id = ?`, [role_id, employee_id]
                , (err, row) => {
                    if (err) {console.log(err);} 
                    
                    viewEmployees();
                })
            })
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
            choices: employeesArray
        }
    ])
    .then( response => {

        // query ids for corresponding employee names
        db.query(`SELECT employees.id FROM employees WHERE concat(employees.first_name,' ',employees.last_name) = '${response.employee}'`
            , (err, row) => {
        if (err) { console.log(err);} 
        const employee_id = row[0].id;

            // if same name chosen for both manager and employee
            if (response.manager === response.employee) {
                console.log(`
                An employee cannot be their own manager!
                
                Let's start that again.
                
                `)
                return updateEmployeeManager();
                
            // if manager is selected
            } else if (response.manager !== "No Manager") {
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

function updateRoleSalary() {

    return inquirer.prompt([
        {
            type: "list",
            name: "role",
            message: "For which role's would you like to change the salary?",
            choices: rolesArray
        },
        {
            type: "input",
            name: "salary",
            message: "What is the new salary for this role?",
            validate: number => {
                if (!isNaN(parseInt(number))) {
                    return true;
                } else {
                    console.log(`
                    Please enter a number for this salary. Up to two decimals.`);
                    return false;
                }
            }
        }
    ])
    .then( response => {

        // query ids for corresponding role names
        db.query(`SELECT roles.id FROM roles WHERE roles.title = '${response.role}'`
            , (err, row) => {
        if (err) { console.log(err);} 
        const id = row[0].id;

        // update salary for given id
        db.query(`UPDATE roles SET salary = ? WHERE id = ?`, [response.salary, id]
            , (err, row) => {
                if (err) {console.log(err);} 
                
                viewRoles();
            })
        })
    })
}



function deleteDepartment() {
    return inquirer.prompt([
        {
            type: "list",
            name: "department",
            message: "Which department would you like to delete?",
            choices: departmentsArray
        },
        {
            type: "confirm",
            name: "deleteCheck",
            message: "Are you sure you want to delete this department?"
        }
    ])
    .then( response => {
        // if delete is confirmed, remove from db and array
        if (response.deleteCheck) {

            const index = departmentsArray.findIndex((dept) => dept === response.department);
            departmentsArray.splice(index, 1);

            db.query(`DELETE FROM departments WHERE name = '${response.department}'`,
            (err, row) => {
                if (err) {console.log(err);}

                // removes affected roles from roles array
                db.query(`SELECT roles.title FROM roles`, (err, rows) => {
                    if (err) { console.log(err);} 
                    rolesArray = rows.map(roles => {
                        return roles.title;
                    });
                });
                return viewDepartments();
            })
        } else {
            return moreQuestions();
        }
    })
}

function deleteRole() {
    return inquirer.prompt([
        {
            type: "list",
            name: "role",
            message: "Which role would you like to delete?",
            choices: rolesArray
        },
        {
            type: "confirm",
            name: "deleteCheck",
            message: "Are you sure you want to delete this role?"
        }
    ])
    .then( response => {
        // if delete is confirmed, remove from db and array
        if (response.deleteCheck) {

            const index = rolesArray.findIndex((job) => job === response.role);
            rolesArray.splice(index, 1);

            db.query(`DELETE FROM roles WHERE title = '${response.role}'`,
            (err, row) => {
                if (err) {console.log(err);}
                
                return viewRoles();
            })
            
        } else {
            return moreQuestions();
        }
    })
}

function deleteEmployee() {
    return inquirer.prompt([
        {
            type: "list",
            name: "employee",
            message: "Which role would you like to delete?",
            choices: employeesArray
        },
        {
            type: "confirm",
            name: "deleteCheck",
            message: "Are you sure you want to delete this employee?"
        }
    ])
    .then( response => {
        // if delete is confirmed, remove from db and array
        if (response.deleteCheck) {

            const index = employeesArray.findIndex((person) => person === response.employee);
            employeesArray.splice(index, 1);

            db.query(`DELETE FROM employees WHERE concat(employees.first_name,' ',employees.last_name) = '${response.employee}'`,
            (err, row) => {
                if (err) {console.log(err);}
                
                return viewEmployees();
            })
            
        } else {
            return moreQuestions();
        }
    })
}

function viewUtilizedBudget() {

    // query department name and sum of salaries from each employee in that department
    db.query(`
        SELECT departments.name AS department, SUM (roles.salary) AS budget
        FROM employees
        LEFT JOIN roles ON employees.role_id = roles.id
        LEFT JOIN departments ON roles.department_id = departments.id
        WHERE departments.name IS NOT NULL
        GROUP BY departments.name
        `, (err, rows) => {
            if (err) { console.log(err);} 
            console.table(rows);
            
            return moreQuestions();
        });
}

// Initialize app
init();