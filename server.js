const inquirer = require('inquirer');
const cTable = require('console.table');
const db = require('./db/connection');
const inputCheck = require('./utils/inputCheck');
const express = require('express');


const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// app.use('/api', apiRoutes);

app.use((req, res) => {
    res.status(404).end();
});


db.connect(err => {
    if (err) throw err;
    console.log('Database connected');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});






console.table([
  {
    name: 'foo',
    age: 10
  }, {
    name: 'bar',
    age: 20
  }
]);