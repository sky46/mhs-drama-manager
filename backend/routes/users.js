const Router = require('express-promise-router');
const argon2 = require('argon2');
require('dotenv').config()
const { pool } = require('../db');  // Import the database connection
const { getUserRole } = require('../helpers');


const router = new Router();
module.exports = router;

/**
 * Unauthenticated route.
 * Create a new student user, i.e. sign up an account. Afterwards, log in with created account.
 * 
 * POST data
 *  - name: Display name
 *  - email: Email, used as identifier and login
 *  - password: Password.
 *  - passwordCheck: Confirm password, which much match password.
 *  - role (DEPRECATED): Has no effect. Formerly used to select student or teacher account type.
 */
router.post('/users/create', async (req, res) => {
    const { name, email, password, passwordCheck, role } = req.body;

    if (!name || !email || !password || !passwordCheck || !role) {
        return res.status(400).json({ error: "Missing fields" }); // Missing fields
    }
    if (password !== passwordCheck) {
        return res.status(400).json({ error: "Passwords do not match" }); // Maybe redundant? (checked in frontend)
    }
    var roleID;
    roleID = 1;
    // if (role === 'teacher') {
    //     roleID = 0;
    // } else if (role === 'student') {
    //     roleID = 1;
    // } else {
    //     return res.status(400).json({ error: 'Invalid role' });
    // }

    try {
        const emailCheckResult = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        if (emailCheckResult.rows.length > 0) {
            return res.status(400).json({ error: 'Email already in use' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Database error', details: error.message });
    }
    
    try {
        const passwordHash = await argon2.hash(password);
        const createUserResult = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, passwordHash, roleID]
        );
        const user = createUserResult.rows[0];

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

/**
 * Unauthenticated route.
 * Check if user with email already exists.
 * 
 * POST data
 *  - email: Email to check.
 * Response
 *  - exists: Boolean representing whether or not a user with this email exists already.
 */
router.post('/users/email', async (req, res) => {
    const { email } = req.body;
    try {
        const emailCheckResult = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        if (emailCheckResult.rows.length > 0) {
            return res.json({ exists: true }); // Exists field for easier checking
        } else {
            return res.json({ exists: false });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Database error', details: error.message });
    }
});

/**
 * Unauthenticated route.
 * Log in user.
 * 
 * POST data
 *  - email: Email.
 *  - password: Password (in plaintext).
 */
router.post('/users/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Missing fields" });
    }

    let userResult;
    try {
        userResult = await pool.query(
            'SELECT id, password FROM users WHERE email = $1', 
            [email]
        );
    } catch (error) {
        return res.status(500).json({ error: "User with email already exists" });
    }

    if (userResult.rows.length) {
        const user = userResult.rows[0];
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

/**
 * Unauthenticated route.
 * Log out user.
 */
router.post('/users/logout', async (req, res) => {
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

/**
 * Unathenticated route.
 * Check whether a user is currently logged in based on browser cookies.
 * 
 * Response
 *  - loggedIn: Boolean representing whether a user is logged in.
 *  - user: Only returned if loggedIn is true. Data of logged in user.
 */
router.get('/users/status', async (req, res) => {
    if (req.session && req.session.user) {
        const userResult = await pool.query(
            'SELECT name, email, role FROM users WHERE id = $1',
            [req.session.user]
        );
        if (userResult.rows.length) {
            return res.json({ loggedIn: true, user: userResult.rows[0] });
        }
    }
    return res.json({ loggedIn: false });
});


/**
 * Authenticated route.
 * Check role of logged in user.
 * 
 * Response
 *  - role: "teacher" or "student" depending on role.
 */
router.get('/users/role', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not logged in" });
    }
    try {
        const role = await getUserRole(req.session.user);
        if (role === null) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.json({ role: role === 0 ? "teacher" : "student" });
    } catch (error) {
        return res.status(500).json({ error: "Database error", details: error.message });
    }
});
