// FOR ACCESSING API ENDPOINTS
const express = require('express');
const { pool } = require('./db');  // Import the database connection
var cors = require('cors')
const { google } = require('googleapis');
const session = require('express-session'); // To maintain user authentication
const path = require('path');


const app = express();
const port = process.env.PORT;
app.use(cors())

app.use(session({
    secret: process.env.SECRET_SESSION_KEY, 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI,
);

// Get all rows from users
app.get('/', async (req, res) => {
    var queryResult = await pool.query('SELECT * FROM users;')
    res.send(queryResult.rows)
})

// Post to create new user
app.post('/users', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing fields" }); // Missing fields
    }

    try {
        const newUser = await createUser(name, email, password);
        res.status(201).json(newUser); // POST Created
    } catch (error) {
        res.status(500).json({ error: "Database error" }); // Internal error
    }
});

app.listen(port, () => {
    console.log(`Backend listening on port ${port}`)
})
