const express = require('express');
const inquirer = require('inquirer');
const cTable = require('console.table');
const db = require('./db/connection');
const inputCheck = require('./utils/inputCheck');

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
    
    return inquirer.prompt([
        {
            type: "list",
            name: "view",
            message: "What would you like to do?",
            choices: ["View All Departments", "View All Roles", "View All Employees", "Add A Department", "Add A Role", "Add An Employee"]
        }
    ])
    .then(answer => {
        if (answer = "View All Departments") {

            db.query(`SELECT * FROM departments`, (err, rows) => {
                if (err) {
                    console.log(err);
                }
                console.table(rows);
                
                return moreQuestions();
            });
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
    console.log(`
    `)

    return inquirer.prompt([
        {
            type: "confirm",
            name: "confirm",
            message: "Would you like to continue?",
        }
    ]).then( answer = (answer) => {
        if (answer === true){
            return questions();
        } else {
        console.log(`
        Thank you for using Your Employee Tracker!
        `);
        }
    })
}

init();