// FOR ACCESSING API ENDPOINTS
const express = require('express');
const { pool } = require('./db');  // Import the database connection
var cors = require('cors')
const session = require('express-session'); // To maintain user authentication
require('dotenv').config()
const pgSession = require('connect-pg-simple')(session);
const {mountRoutes} = require('./routes');


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
    cookie: { secure: false, maxAge: 1000 * 3600 * 24 * 90 } 
}));

mountRoutes(app);

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
