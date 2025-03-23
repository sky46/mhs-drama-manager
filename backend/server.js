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

async function getUserRole(id) {
    try {
        const queryText = 'SELECT role FROM USERS WHERE id = $1;';
        const queryParams = [id];
        const queryResult = await pool.query(queryText, queryParams);
        if (queryResult.rows.length === 0) {
            return null;
        } else {
            return queryResult.rows[0].role;
        }
    } catch (error) {
        console.error('Database query error:', error);
    }
}


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

        // Not valid password
        if (!isValidPassword) {
            return res.status(403).json({
                error: 'Incorrect login info',
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
                    message: 'Logged in',
                });
            });
        });
        
    } else {
        return res.status(403).json({ 
            error: 'Incorrect login info',
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

// Route to get productions user is a part of 
app.get('/productions', async (req, res) => {
    const userId = req.session.user;
    if (!userId) {
        return res.status(401).json({ error: "Not logged in" });
    } 
    
    try {
        const productionsQueryText = `
            SELECT productions.id, productions.name
            FROM productions
            JOIN productions_users ON productions.id = productions_users.production_id
            WHERE productions_users.user_id = $1
        `   // from productions table, it matches records for productions users id = productions id where it is the desired user id and returns the id and name for the filtered data
        const productionQueryParams = [userId];

        const productionsResult = await pool.query(productionsQueryText, productionQueryParams);
        const productions = productionsResult.rows;

        const productionIds = productions.map(p => p.id);
        if (productionIds.length === 0) {
            return res.status(200).json({ productions: [], teachers: [] });
        }

        const teachersQuery = `
            SELECT users.id AS teacher_id, users.name AS teacher_name, productions_users.production_id
            FROM users
            JOIN productions_users ON users.id = productions_users.user_id
            WHERE productions_users.production_id = ANY($1)
            AND users.role = 0;
        `   // from users table, match records for production users id = productions id where the desired production id is given and selects all the teachers (0)
        const teachersResult = await pool.query(teachersQuery, [productionIds]);

        // Organizing teachers by production
        const teachersByProduction = {};
        teachersResult.rows.forEach(({ production_id, teacher_id, teacher_name }) => {
            if (!teachersByProduction[production_id]) { //not yet existing
                teachersByProduction[production_id] = [];
            }
            teachersByProduction[production_id].push({ id: teacher_id, name: teacher_name });
        });

        const studentQuery = `
            SELECT users.id AS student_id, users.name AS student_name, productions_users.production_id
            FROM users
            JOIN productions_users ON users.id = productions_users.user_id
            WHERE productions_users.production_id = ANY($1)
            AND users.role = 1;
        `   // from users table, match records for production users id = productions id where the desired production id is given and selects all the teachers (0)
        const studentResult = await pool.query(studentQuery, [productionIds]);
        // Reduce accumulates amount of students (applied to each row)
        const studentCountByProduction = studentResult.rows.reduce((acc, { production_id }) => {
            if (!acc[production_id]) { // if no value for accumulator yet, make it 0 so not falsy
                acc[production_id] = 0;
            }
            acc[production_id]++;
            return acc;
        }, {});

        // Use spread to add teachers to each production
        const productionsWithTeachersAndStudents = productions.map(prod => ({
            ...prod,
            teachers: teachersByProduction[prod.id] || [],
            student: studentCountByProduction[prod.id] || 0
        }));
        return res.status(200).json({ productions: productionsWithTeachersAndStudents });
    } catch (error) {
        console.error("Database query error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

app.post('/productions/new', async (req, res) => {
    const userId = req.session.user;
    if (!userId) {
        return res.status(401).json({ error: "Not logged in" });
    }
    // Check if user is teacher
    const role = await getUserRole(userId);
    if (role !== 0) {
        return res.status(403).json({ error: "Missing permissions "});
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN;');
        const {name, teachers, students} = req.body;
        const createQueryResult = await client.query(
            'INSERT INTO productions (name) VALUES ($1) RETURNING id;',
            [name],
        );
        const productionId = createQueryResult.rows[0].id;
        // Creator teacher
        await client.query(
            'INSERT INTO productions_users (production_id, user_id) VALUES ($1, $2);',
            [productionId, userId],
        );
        // Other users
        for (const user of teachers.concat(students)) {
            await client.query(
                'INSERT INTO productions_users (production_id, user_id) VALUES ($1, $2);',
                [7, user.value],
            );
        }
        await client.query('COMMIT;');
        res.status(201).json({productionId: productionId});
    } catch (error) {
        await client.query('ROLLBACK;');
        console.error('Database error:', error);
        res.status(500).json({error: 'Internal server error', details: error.message,})
    } finally {
        client.release();
    }
});

// Available users to add to production when creating, i.e. all users but self
app.get('/productions/new/availableusers', async (req, res) => {
    const userId = req.session.user;
    if (!userId) {
        return res.status(401).json({ error: "Not logged in" });
    }
    // Check if user is teacher
    const role = await getUserRole(userId);
    if (role !== 0) {
        return res.status(403).json({ error: "Missing permissions "});
    }

    try {
        const teachersResult = await pool.query(
            'SELECT id, name FROM users WHERE role = 0 AND id <> $1;',
            [userId]
        );
        const studentsResult = await pool.query('SELECT id, name FROM users WHERE role = 1;');
        return res.status(200).json({teachers: teachersResult.rows, students: studentsResult.rows,});
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({error: 'Internal server error', details: error.message,})
    }
});

// Route to get productions user is a part of 
app.get('/productions/:productionId', async (req, res) => {
    const userId = req.session.user;
    if (!userId) {
        return res.status(401).json({ error: "Not logged in" });
    }
    const productionId = req.params.productionId; 
    
    try {
        const productionQueryText = `
            SELECT id, name
            FROM productions
            WHERE id = $1;
        `;
        const productionQueryParams = [productionId];
        const productionResult = await pool.query(productionQueryText, productionQueryParams);
        if (productionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Production not found'})
        }

        const accessQueryText = `
            SELECT productions.id
            FROM productions
            INNER JOIN productions_users ON productions.id = productions_users.production_id
            WHERE productions_users.production_id = $1 AND productions_users.user_id = $2;
        `
        const accessQueryParams = [productionId, userId];
        const accessResult = await pool.query(accessQueryText, accessQueryParams);
        if (accessResult.rows.length === 0) {
            return res.status(401).json({ error: 'User is not a part of production'});
        }

        const teachersQueryText = `
            SELECT users.id, users.name
            FROM users
            INNER JOIN productions_users ON users.id = productions_users.user_id
            WHERE productions_users.production_id = $1 AND users.role = 0;
        `
        const teachersQueryParams = [productionId];
        const teachersResult = await pool.query(teachersQueryText, teachersQueryParams);

        const studentCountQueryText = `
            SELECT COUNT(*)
            FROM users
            INNER JOIN productions_users ON users.id = productions_users.user_id
            WHERE productions_users.production_id = $1 AND users.role = 1;
        `
        const studentCountQueryParams = [productionId];
        const studentCountResult = await pool.query(studentCountQueryText, studentCountQueryParams);
        
        productionData = {
            id: productionResult.rows[0].id,
            name: productionResult.rows[0].name,
            teachers: teachersResult.rows,
            studentCount: studentCountResult.rows[0].count,
        };
        return res.status(200).json({productionData: productionData});
    } catch (error) {
        console.error("Database query error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// route to mark somebody as checked in
app.post('/productions/:productionId/markselfattended', async (req, res) => {
    const userId = req.session.user;
    const productionId = req.params.productionId; 
    const attendanceDate = new Date().toISOString().split('T')[0]; // yyyy-mm-dd

    if (!userId) {
        return res.status(401).json({ error: "Not logged in" });
    }
    const role = await getUserRole(userId);
    if (role !== 1) { //need to be student to be in attendance
        console.log("IDS", userId, role);
        return res.status(403).json({ error: "Missing permissions"});
    }

    const checkQuery = `
        SELECT 1 FROM attendance 
        WHERE user_id = $1 AND production_id = $2 AND attendance_date = $3
    `;

    const attendanceText = `INSERT INTO attendance (user_id, production_id, attendance_date) VALUES ($1, $2, $3)`;
    const attendanceParams = [userId, productionId, attendanceDate];
    
    const existing = await pool.query(checkQuery, attendanceParams);

    if (existing.rowCount > 0) {
        return res.status(409).json({ error: "Duplicate attendance" });
    } else {
        try {
            await pool.query(attendanceText, attendanceParams);
            return res.status(200).json({tracked: true});
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
    }
})

app.post('/productions/:productionId/markstudentsattended', async (req, res) => {
    const userId = req.session.user;
    const productionId = req.params.productionId; 
    const attendanceDate = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
    const {students,} = req.body;

    if (!userId) {
        return res.status(401).json({ error: "Not logged in" });
    }
    const role = await getUserRole(userId);
    if (role !== 0) {
        return res.status(403).json({ error: "Missing permissions "});
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (const student of students) {
            await client.query(
                'INSERT INTO attendance (user_id, production_id, attendance_date) VALUES ($1, $2, $3)',
                [student.value, productionId, attendanceDate]
            );
        }
        await client.query('COMMIT');
        res.status(200).json({message: 'Attendance marked successfully'});
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
})

// route to check attendance
app.get('/productions/:productionId/attendance', async (req, res) => {
    const userId = req.session.user;
    const productionId = req.params.productionId; 
    const attendanceDate = req.query.attendanceDate;
    if (!userId) {
        return res.status(401).json({ error: "Not logged in" });
    }
    // Check if user is teacher
    const role = await getUserRole(userId);
    if (role !== 0) {
        return res.status(403).json({ error: "Missing permissions "});
    }

    // Check if teacher is part of production
    const allowedQueryText = 'SELECT * FROM productions_users WHERE production_id = $1 AND user_id = $2;';
    const allowedQueryParams = [productionId, userId];
    const allowedQueryResult = await pool.query(allowedQueryText, allowedQueryParams);
    if (allowedQueryResult.rows.length === 0) {
        return res.status(403).json({ error: "Missing permissions "});
    }

    const queryText = `
        SELECT users.name, productions.name, attendance.attendance_date
        FROM attendance
        JOIN users ON attendance.user_id = users.id
        JOIN productions ON attendance.production_id = productions.id
        WHERE attendance.production_id = $1 AND attendance.attendance_date = $2;
    `;

    const queryParams = [productionId, attendanceDate];

    try {
        const result = await pool.query(queryText, queryParams);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No attendance found' });
        }

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/productions/:productionId/attendance/all', async (req, res) => {
    const userId = req.session.user;
    const productionId = req.params.productionId; 

    if (!userId) {
        return res.status(401).json({ error: "Not logged in" });
    }

    const allowedQueryText = 'SELECT * FROM productions_users WHERE production_id = $1 AND user_id = $2;';
    const allowedQueryParams = [productionId, userId];
    const allowedQueryResult = await pool.query(allowedQueryText, allowedQueryParams);
    if (allowedQueryResult.rows.length === 0) {
        return res.status(403).json({ error: "Missing permissions "});
    }

    const queryAllAttendanceText = `
        SELECT attendance.attendance_date
        FROM attendance
        JOIN users ON attendance.user_id = users.id
        JOIN productions ON attendance.production_id = productions.id
        WHERE attendance.production_id = $1 AND attendance.user_id = $2;
    `
    const queryAllAttendanceParams = [productionId, userId];
    try {
        const result = await pool.query(queryAllAttendanceText, queryAllAttendanceParams);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No attendance found' });
        }

        return res.json({ attendance: result.rows });
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }

})


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
