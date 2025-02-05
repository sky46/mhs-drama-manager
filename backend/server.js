// FOR ACCESSING API ENDPOINTS
const express = require('express');
const { pool } = require('./db');  // Import the database connection
var cors = require('cors')
const { google } = require('googleapis');
const session = require('express-session'); // To maintain user authentication
const path = require('path');
require('dotenv').config()
const argon2 = require('argon2');

const app = express();
const port = process.env.PORT;
app.use(cors({ origin: '*' }));

console.log("Session Secret Key:", process.env.SECRET_SESSION_KEY);

app.use(session({
    secret: process.env.SECRET_SESSION_KEY, 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// To be able to access oauth2.0
const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI,
);

// Route to acccess auth screen
app.get('/auth/google', (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',  // Request refresh token to allow access after sign out
      scope: ['https://www.googleapis.com/auth/calendar.events'] 
    });
    res.redirect(authUrl);
});

// Dashboard after user authenticated
app.get('/dashboard', (req, res) => {
    if (!req.session.tokens) {
      return res.redirect('/auth/google'); // Redirect to login if not authed
    }
    res.send('Welcome to your dashboard!');
});

// Route to redirect after giving consent
app.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query; // Authorization code from auth
  
    try {
      // Get the OAuth tokens using the authorization code
      const { tokens } = await oAuth2Client.getToken(code);
      req.session.tokens = tokens;
      // Set the OAuth client with tokens
      oAuth2Client.setCredentials(tokens);
      // Redirect to dashboard after login
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Error getting tokens:', error);
      res.status(500).send('Authentication failed');
    }
  });


// Get all rows from users
app.get('/', async (req, res) => {
    try {
        var queryResult = await pool.query('SELECT * FROM users;');
        res.json(queryResult.rows);
    } catch (error) {
        console.error("Database query error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// Post to create new user
app.post('/users/create', async (req, res) => {
    const { name, email, password, passwordCheck, role } = req.body;

    if (!name || !email || !password || !passwordCheck || !role) {
        return res.status(400).json({ error: "Missing fields" }); // Missing fields
    }
    if (password !== passwordCheck) {
        return res.status(400).json({ error: "Passwords do not match" });
    }
    var roleID;
    if (role === 'teacher') {
        roleID = 0;
    } else if (role === 'student') {
        roleID = 1;
    } else {
        return res.status(400).json({ error: 'Invalid role' });
    }
    
    const passwordHash = await argon2.hash(password);
    const queryText = 'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *';
    const queryParams = [name, email, passwordHash, roleID];
    try {

        const queryResult = await pool.query(queryText, queryParams);
        res.status(201).json(queryResult); // POST Created
    } catch (error) {
        res.status(500).json({ error: "Database error" }); // Internal error
    }
});

app.listen(port, () => {
    console.log(`Backend listening on port ${port}`)
});
