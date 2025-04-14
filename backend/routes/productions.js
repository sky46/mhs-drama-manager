const Router = require('express-promise-router');
require('dotenv').config()
const { pool } = require('../db');  // Import the database connection
const { getUserRole } = require('../helpers');


const router = new Router();
module.exports = router;

// Route to get productions user is a part of 
router.get('/productions', async (req, res) => {
    const userId = req.session.user;
    if (!userId) {
        return res.status(401).json({ error: "Not logged in" });
    } 
    
    try {

        const productionsResult = await pool.query(
            `SELECT productions.id, productions.name
            FROM productions
            JOIN productions_users ON productions.id = productions_users.production_id
            WHERE productions_users.user_id = $1`,
            [userId]
        );
        const productions = productionsResult.rows;

        const productionIds = productions.map(p => p.id);
        if (productionIds.length === 0) {
            return res.status(200).json({ productions: [], teachers: [] });
        }
        // from users table, match records for production users id = productions id where the desired production id is given and selects all the teachers (0)
        const teachersResult = await pool.query(
            `SELECT users.id AS teacher_id, users.name AS teacher_name, productions_users.production_id
            FROM users
            JOIN productions_users ON users.id = productions_users.user_id
            WHERE productions_users.production_id = ANY($1)
            AND users.role = 0;`, 
            [productionIds]
        );

        // Organizing teachers by production
        const teachersByProduction = {};
        teachersResult.rows.forEach(({ production_id, teacher_id, teacher_name }) => {
            if (!teachersByProduction[production_id]) { //not yet existing
                teachersByProduction[production_id] = [];
            }
            teachersByProduction[production_id].push({ id: teacher_id, name: teacher_name });
        });

        // from users table, match records for production users id = productions id where the desired production id is given and selects all the teachers (0)
        const studentResult = await pool.query(
            `SELECT users.id AS student_id, users.name AS student_name, productions_users.production_id
            FROM users
            JOIN productions_users ON users.id = productions_users.user_id
            WHERE productions_users.production_id = ANY($1)
            AND users.role = 1`,
            [productionIds]
        );
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

router.post('/productions/new', async (req, res) => {
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
        await client.query('BEGIN');
        const {name, teachers, students} = req.body;
        const createQueryResult = await client.query(
            'INSERT INTO productions (name) VALUES ($1) RETURNING id',
            [name],
        );
        const productionId = createQueryResult.rows[0].id;
        // Creator teacher
        await client.query(
            'INSERT INTO productions_users (production_id, user_id) VALUES ($1, $2)',
            [productionId, userId],
        );
        // Other users
        for (const user of teachers.concat(students)) {
            await client.query(
                'INSERT INTO productions_users (production_id, user_id) VALUES ($1, $2)',
                [7, user.value],
            );
        }
        await client.query('COMMIT');
        res.status(201).json({productionId: productionId});
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Database error:', error);
        res.status(500).json({error: 'Internal server error', details: error.message,})
    } finally {
        client.release();
    }
});

// Available users to add to production when creating, i.e. all users but self
router.get('/productions/new/availableusers', async (req, res) => {
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
            'SELECT id, name FROM users WHERE role = 0 AND id <> $1',
            [userId]
        );
        const studentsResult = await pool.query('SELECT id, name FROM users WHERE role = 1');
        return res.status(200).json({teachers: teachersResult.rows, students: studentsResult.rows,});
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({error: 'Internal server error', details: error.message,})
    }
});

// Route to get productions user is a part of 
router.get('/productions/:productionId', async (req, res) => {
    const userId = req.session.user;
    if (!userId) {
        return res.status(401).json({ error: "Not logged in" });
    }
    const productionId = req.params.productionId; 
    const role = await getUserRole(userId);

    try {
        const productionResult = await pool.query(
            'SELECT id, name FROM productions WHERE id = $1',
            [productionId]
        );
        if (productionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Production not found'})
        }
        const accessResult = await pool.query(
            `SELECT productions.id
            FROM productions
            INNER JOIN productions_users ON productions.id = productions_users.production_id
            WHERE productions_users.production_id = $1 AND productions_users.user_id = $2`,
            [productionId, userId]
        );
        if (accessResult.rows.length === 0) {
            return res.status(401).json({ error: 'User is not a part of production'});
        }

        const teachersResult = await pool.query(
            `SELECT users.id, users.name
            FROM users
            INNER JOIN productions_users ON users.id = productions_users.user_id
            WHERE productions_users.production_id = $1 AND users.role = 0;`,
            [productionId]
        );

        const formatDate = (date) => new Date(date).toISOString().split('T')[0];
        const todayFormatted = formatDate(new Date());
        var attendance, studentCount, selfAttendanceHistory, selfMarkedPresent;
        
        if (role === 0) {
            // Teacher
            const presentStudentsResult = await pool.query(
                `SELECT id, name
                FROM users
                INNER JOIN attendance ON users.id = attendance.user_id
                WHERE attendance.production_id = $1 AND attendance.attendance_date = $2 AND role = 1`,
                [productionId, todayFormatted]
            );
            const absentStudentsResult = await pool.query(
                `SELECT id, name
                FROM users
                INNER JOIN productions_users ON users.id = productions_users.user_id
                WHERE productions_users.production_id = $1
                    AND id NOT IN
                        (SELECT user_id
                        FROM attendance
                        WHERE production_id = $1 AND attendance_date = $2)
                    AND role = 1`,
                [productionId, todayFormatted]
            );
            attendance = {present: presentStudentsResult.rows, absent: absentStudentsResult.rows};
            studentCount = attendance.present.length + attendance.absent.length;
        } else {
            // Student
            const selfAttendanceHistoryResult = await pool.query(
                `SELECT attendance.attendance_date
                FROM attendance
                JOIN users ON attendance.user_id = users.id
                JOIN productions ON attendance.production_id = productions.id
                WHERE attendance.production_id = $1 AND attendance.user_id = $2`,
                [productionId, userId]
            );
            selfAttendanceHistory = selfAttendanceHistoryResult.rows;
            const studentCountResult = await pool.query(
                `SELECT COUNT(*)
                FROM users
                INNER JOIN productions_users ON users.id = productions_users.user_id
                WHERE productions_users.production_id = $1 AND users.role = 1`,
                [productionId]
            );
            studentCount = studentCountResult.rows[0].count;

            selfMarkedPresent = selfAttendanceHistory.some(
                (row) => formatDate(row.attendance_date) === todayFormatted
            );
        }
        
        productionData = {
            id: productionResult.rows[0].id,
            name: productionResult.rows[0].name,
            teachers: teachersResult.rows,
            studentCount: studentCount,
            ...(role === 0
                ? {attendance: attendance}
                : {
                    selfAttendanceHistory: selfAttendanceHistory,
                    selfMarkedPresent: selfMarkedPresent
                }
            )
        };
        return res.status(200).json({productionData: productionData, role: role});
    } catch (error) {
        console.error("Database query error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// Get data for existing production including existing/available users
router.get('/productions/:productionId/getEditData', async (req, res) => {
    const userId = req.session.user;
    if (!userId) {
        return res.status(401).json({ error: "Not logged in" });
    }
    const productionId = req.params.productionId;

    try {
        const role = await getUserRole(userId);
        const productionResult = await pool.query(
            'SELECT id, name FROM productions WHERE id = $1',
            [productionId]
        );
        if (productionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Production not found'})
        }
        const accessResult = await pool.query(
            `SELECT productions.id
            FROM productions
            INNER JOIN productions_users ON productions.id = productions_users.production_id
            WHERE productions_users.production_id = $1 AND productions_users.user_id = $2`,
            [productionId, userId]
        );
        if (accessResult.rows.length === 0) {
            return res.status(401).json({ error: 'User is not a part of production'});
        }

        const currentTeachersResult = await pool.query(
            `SELECT users.id, users.name
            FROM users
            INNER JOIN productions_users ON users.id = productions_users.user.id
            WHERE productions_users.production_id = $1 AND users.role = 0`,
            [productionId]
        );
        const availableTeachersResult = await pool.query(
            
        )

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
})