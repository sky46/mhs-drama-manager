// FOR ACCESSING API ENDPOINTS
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3001;

const pool = new Pool({
    connectionString: 'postgres://postgres:password@db:5432/postgres'
})

app.get('/', async (req, res) => {
    var queryResult = await pool.query('SELECT * FROM test;')
    res.send(`Hello World! ${JSON.stringify(queryResult.rows)}`)

})

app.listen(port, () => {
    console.log(`Backend listening on port ${port}`)
})
