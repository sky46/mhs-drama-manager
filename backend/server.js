// FOR ACCESSING API ENDPOINTS
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3001;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

app.get('/', async (req, res) => {
    var queryResult = await pool.query('SELECT * FROM test;')
    res.send(queryResult.rows)

})

app.listen(port, () => {
    console.log(`Backend listening on port ${port}`)
})
