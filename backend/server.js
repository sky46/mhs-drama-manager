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
