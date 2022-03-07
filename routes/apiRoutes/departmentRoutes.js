const express = require("express");
const router = express.Router();
const db = require('../../db/connection');
const inputCheck = require("../../utils/inputCheck");
const cTable = require('console.table');



router.get('/departments', (req, res) => {
    const sql = `USE company
    SELECT * FROM departments`;

    db.query(sql, (err, rows) =>{
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'Success!',
            data: rows
        });
        console.table(rows);
    });
});



module.exports = { router };