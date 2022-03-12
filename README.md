# Employee Tracker CMS

<img width="1048" alt="employee-worker-cms-screenshot" src='assets/images/cms_screenshot.png'>

## Usage

For an example of the Employee Tracker CMS in action, just watch this walkthrough: https://drive.google.com/file/d/1iAomKoLx99m-yUm-8LU0kYWnuV9kBbBM/view

## Description

A simple Command Line employee tracker for managing several aspects of your company.  With the Employee Tracker, you'll be able to view your departments, company roles, employees, and view employees based on their departments or managers. You'll be able to add new departments, roles, or employees. You can update current employees, roles, managers, or a role's salary.  You can delete employees, roles, or departments from the database. And you can even view a utilized budget for each department.  It can truly do it all! 

## Installation

Just clone this repository and run npm install mysql2 sequelize console.table, and then you're ready to go.

## Test

The db.sql, schema.sql, and seeds.sql files are included. Launch the mysql server with your username and password: 

`mysql -u <your_username> -p`

And then enter your mysql password. 


Then from the mysql monitor run the following commands:

`source db/db.sql`
`source db/schema.sql`
`source db/seeds.sql`

And your database will be seeded with example departments, roles, and employees.
To return to an empty database, repeat the previous commands, but do not run:

`source db/seeds.sql`


## Questions?

For any further questions, you can find my github profile here: https://github.com/MrSumada
