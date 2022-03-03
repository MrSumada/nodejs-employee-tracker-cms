const mysql = require("mysql2");

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'Mag09nus!',
        database: 'election'
    });

module.exports = db;