// FOR ACCESSING API ENDPOINTS
const express = require('express');
const { pool } = require('./db');  // Import the database connection
var cors = require('cors')
const { google } = require('googleapis');
const session = require('express-session'); // To maintain user authentication
const path = require('path');
require('dotenv').config()
const argon2 = require('argon2');
const pgSession = require('connect-pg-simple')(session);

const app = express();
const port = process.env.PORT;
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());

app.use(session({
    store: new pgSession({
        pool: pool
    }),
    secret: process.env.SECRET_SESSION_KEY, 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));


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
    console.log(name, email, password, passwordCheck, role);

    if (!name || !email || !password || !passwordCheck || !role) {
        return res.status(400).json({ error: "Missing fields" }); // Missing fields
    }
    if (password !== passwordCheck) {
        return res.status(400).json({ error: "Passwords do not match" }); // Maybe redundant? (checked in frontend)
    }
    var roleID;
    if (role === 'teacher') {
        roleID = 0;
    } else if (role === 'student') {
        roleID = 1;
    } else {
        return res.status(400).json({ error: 'Invalid role' });
    }

    const emailCheckQuery = 'SELECT * FROM users WHERE email = $1';
    try {
        const emailCheckResult = await pool.query(emailCheckQuery, [email]);
        if (emailCheckResult.rows.length > 0) {
            return res.status(400).json({ error: 'Email already in use' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Database error', details: error.message });
    }
    
    try {
        const passwordHash = await argon2.hash(password);
        const queryText = 'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role';
        const queryParams = [name, email, passwordHash, roleID];
        const queryResult = await pool.query(queryText, queryParams);
        const user = queryResult.rows[0];

        // Login with signup
        req.session.regenerate((err) => {
            if (err) {
                return res.status(500).json({ error: "Session error" });
            }

            req.session.user = user.id;
            req.session.save((err) => {
                if (err) {
                    return res.status(500).json({ error: "Session save error" });
                }

                return res.status(200).json({
                    message: "User created and logged in",
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: "Database error" }); // Internal error
    }

    
});

// Post to check user email if already registered
app.post('/users/email', async (req, res) => {
    const { email } = req.body;
    const emailCheckQuery = 'SELECT * FROM users WHERE email = $1';
    try {
        const emailCheckResult = await pool.query(emailCheckQuery, [email]);
        if (emailCheckResult.rows.length > 0) {
            return res.json({ exists: true }); // Exists field for easier checking
        } else {
            return res.json({ exists: false });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// Post to login user
app.post('/users/login', async (req, res) => {
    const { nameOrEmail, password } = req.body;

    if (!nameOrEmail || !password) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const queryText = 'SELECT id, password FROM users WHERE email = $1 OR name = $2'
    const queryParams = [nameOrEmail, nameOrEmail];
    let queryResult;

    try {
        queryResult = await pool.query(queryText, queryParams);
    } catch (error) {
        return res.status(500).json({ error: "Database error" });
    }

    if (queryResult.rows.length) {
        const user = queryResult.rows[0];
        const isValidPassword = await argon2.verify(user.password, password);
        console.log("Stored Password Hash:", user.password);
        console.log("Entered Password:", password);
        console.log("Password Verification Result:", isValidPassword);


        // Not valid password
        if (!isValidPassword) {
            return res.status(403).json({
                nameOrEmailMatched: true,
                passwordMatched: false,
            });
        }

        // Cookies to stay logged in
        req.session.regenerate((err) => {
            if (err) {
                console.error("Session Regeneration Error:", err);
                return res.status(500).json({ error: "Session error" });
            }
        
            req.session.user = user.id;
            req.session.save((err) => {
                if (err) {
                    console.error("Session Save Error:", err);
                    return res.status(500).json({ error: "Session save error" });
                }
        
                return res.status(200).json({
                    nameOrEmailMatched: true,
                    passwordMatched: true,
                    userId: req.session.user
                });
            });
        });
        
    } else {
        // Not valid email/name
        return res.status(403).json({ 
            nameOrEmailMatched: false,
            passwordMatched: false,
            error: 'Invalid email/name and/or password'
        });
    }
});

app.post('/users/nameemailpassword', async (req, res) => {
    const { nameOrEmail, password } = req.body;

    if (!nameOrEmail || !password) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const queryText = 'SELECT id, password FROM users WHERE email = $1 OR name = $2';
    const queryParams = [nameOrEmail, nameOrEmail];
    let queryResult;

    try {
        queryResult = await pool.query(queryText, queryParams);
    } catch (error) {
        return res.status(500).json({ error: "Database error", details: error.message });
    }

    if (queryResult.rows.length) {
        const user = queryResult.rows[0];
        const isValidPassword = await argon2.verify(user.password, password);

        if (!isValidPassword) {
            return res.status(403).json({
                nameOrEmailMatched: true,
                passwordMatched: false
            });
        }

        return res.status(200).json({
            nameOrEmailMatched: true,
            passwordMatched: true,
            userId: user.id
        });

    } else {
        return res.status(403).json({ 
            nameOrEmailMatched: false,
            passwordMatched: false,
            error: 'Invalid email/name and/or password'
        });
    }
});

app.post('/users/logout', async (req, res) => {
    req.session.user = null;
    req.session.save((err) => {
        if (err) {
            next(err);
        }
        req.session.regenerate((err) => {
            if (err) {
                next(err);
            }
            res.status(200).json({message: "Logout succesful"});
        })
    })
});

// Check if logged in
app.get('/users/status', (req, res) => {
    if (req.session && req.session.user) {
        return res.json({ loggedIn: true, userId: req.session.user });
    }
    res.json({ loggedIn: false });
});

// Route to check if teacher vs student
app.get('/users/role', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not logged in" });
    }
    try {
        const queryText = 'SELECT role FROM users WHERE id = $1';
        const queryParams = [req.session.user]
        const queryResult = await pool.query(queryText, queryParams);

        if (queryResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const roleID = queryResult.rows[0].role;
        return res.json({ role: roleID === 0 ? "teacher" : "student" });
    } catch (error) {
        return res.status(500).json({ error: "Database error", details: error.message });
    }
});


app.listen(port, () => {
    console.log(`Backend listening on port ${port}`)
});


/* Temp commenting out the google calendar to focus on just user registration
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

*/
// Get all rows from users
