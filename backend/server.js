// FOR ACCESSING API ENDPOINTS
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3001;

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Backend listening on port ${port}`)
})
