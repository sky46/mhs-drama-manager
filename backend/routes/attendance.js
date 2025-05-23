const Router = require('express-promise-router');
require('dotenv').config()
const { pool } = require('../db');  // Import the database connection
const sendReminderEmails = require('../services/email'); // Import function (PROBLEM, FIGURE OUT WHY EMAIL NOT WORKING)
const { getUserRole, localDateFormat } = require('../helpers');

const router = new Router();
module.exports = router;

// route to mark somebody as checked in
router.post('/productions/:productionId/markselfattended', async (req, res) => {
    const userId = req.session.user;
    const productionId = req.params.productionId; 
    const attendanceDate = localDateFormat.format(new Date());

    if (!userId) {
        return res.status(401).json({ error: "Not logged in" });
    }
    const role = await getUserRole(userId);
    if (role !== 1) { //need to be student to be in attendance
        return res.status(403).json({ error: "Missing permissions"});
    }

    const attendanceParams = [userId, productionId, attendanceDate];
    
    const existing = await pool.query(
        `SELECT 1 FROM attendance 
        WHERE user_id = $1 AND production_id = $2 AND attendance_date = $3`,
        attendanceParams
    );

    if (existing.rowCount > 0) {
        return res.status(409).json({ error: "Duplicate attendance" });
    } else {
        try {
            const markAttendanceResult = await pool.query(
                'INSERT INTO attendance (user_id, production_id, attendance_date) VALUES ($1, $2, $3) RETURNING attendance_date',
                attendanceParams
            );
            return res.status(200).json({markedPresentRow: markAttendanceResult.rows[0]});
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
    }
})

router.post('/productions/:productionId/markstudentsattended', async (req, res) => {
    const userId = req.session.user;
    const productionId = req.params.productionId; 
    const todayLocal = localDateFormat.format(new Date());
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
                [student.value, productionId, todayLocal]
            );
        }
        await client.query('COMMIT');
        client.release();
    } catch (error) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(500).json({ error: 'Internal server error' });
    }

    const presentStudentsResult = await pool.query(
        `SELECT id, name
        FROM users
        JOIN attendance ON users.id = attendance.user_id
        WHERE attendance.production_id = $1 AND attendance.attendance_date = $2 AND role = 1`,
        [productionId, todayLocal]
    );
    const absentStudentsResult = await pool.query(
        `SELECT id, name
        FROM users
        JOIN productions_users ON users.id = productions_users.user_id
        WHERE productions_users.production_id = $1
            AND id NOT IN
                (SELECT user_id
                FROM attendance
                WHERE production_id = $1 AND attendance_date = $2)
            AND role = 1`,
        [productionId, todayLocal]
    );
    attendance = {present: presentStudentsResult.rows, absent: absentStudentsResult.rows};
    return res.status(200).json({message: 'Attendance marked successfully', newAttendance: attendance});
})

// Get all attendance history for all students for a production
router.get('/productions/:productionId/attendance', async (req, res) => {
    const userId = req.session.user;
    const productionId = req.params.productionId; 
    if (!userId) {
        return res.status(401).json({ error: "Not logged in" });
    }
    // Check if user is teacher
    const role = await getUserRole(userId);
    if (role !== 0) {
        return res.status(403).json({ error: "Missing permissions "});
    }

    const productionResult = await pool.query(
        'SELECT name FROM productions WHERE id = $1', [productionId]
    );
    if (productionResult.rows.length === 0) {
        return res.status(404).json({error: 'Production not found'});
    }
    // Check if teacher is part of production
    const allowedQueryResult = await pool.query(
        'SELECT * FROM productions_users WHERE production_id = $1 AND user_id = $2',
        [productionId, userId]
    );
    if (allowedQueryResult.rows.length === 0) {
        return res.status(403).json({ error: "Missing permissions "});
    }

    try {
        // https://launchschool.com/books/sql/read/joins (left join section) -> used to implement collection of all user data even if they aren't in they don't have attendance data yet
        // https://www.ibm.com/docs/en/db2-for-zos/12.0.0?topic=type-arrays-in-sql-statements -> used to create a list of all the attendance dates within SQL
        const attendanceResult = await pool.query(
            `SELECT users.id, users.name, array_agg(DISTINCT attendance.attendance_date) AS attendance_dates
            FROM users
            LEFT JOIN attendance ON attendance.user_id = users.id
            LEFT JOIN productions ON attendance.production_id = productions.id
            WHERE (attendance.production_id = $1 OR attendance.production_id IS NULL)
            AND users.role = 1
            GROUP BY users.id
            ORDER BY users.name DESC`,
            [productionId]
        ); 
        
        //console.log(attendanceResult.rows)

        var attendance = [];
        var curStudent;
        var curStudentDates;
        attendanceResult.rows.forEach((row) => {
            curStudent = {name: row.name, user_id: row.id};
            curStudentDates = {};
            row.attendance_dates.forEach((date) => {
                if (date) {
                    const localDate = localDateFormat.format(date);
                    curStudentDates[localDate] = true;
                }
            });
            curStudent.attendedDates = curStudentDates;
            attendance.push(curStudent);
        });
        return res.status(200).json({attendance: attendance, production: productionResult.rows[0]});
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/productions/:productionId/attendance/all', async (req, res) => {
    const userId = req.session.user;
    const productionId = req.params.productionId; 

    if (!userId) {
        return res.status(401).json({ error: "Not logged in" });
    }

    const allowedQueryResult = await pool.query(
        `SELECT * FROM productions_users WHERE production_id = $1 AND user_id = $2`,
        [productionId, userId]
    );
    if (allowedQueryResult.rows.length === 0) {
        return res.status(403).json({ error: "Missing permissions "});
    }

    try {
        const attendanceResult = await pool.query(
            `SELECT attendance.attendance_date
            FROM attendance
            JOIN users ON attendance.user_id = users.id
            JOIN productions ON attendance.production_id = productions.id
            WHERE attendance.production_id = $1 AND attendance.user_id = $2`,
            [productionId, userId]
        );

        return res.json({ attendance: attendanceResult.rows });
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }

})

router.post("/productions/:productionId/attendance/reminder", async (req, res) => {
    const userId = req.session.user;
    if (!userId) {
        return res.status(401).json({ error: "Not logged in" });
    }
    const productionId = req.params.productionId; 
    const role = await getUserRole(userId);
    if (role == 1) {
        return res.json({message: "No access"});
    }
    const todayLocal = localDateFormat.format(new Date());
    try {
        const absentStudentsResult = await pool.query(
            `SELECT productions_users.user_id FROM productions_users
            JOIN users ON productions_users.user_id = users.id
            LEFT JOIN attendance
                ON productions_users.user_id = attendance.user_id 
                AND productions_users.production_id = attendance.production_id 
                AND attendance.attendance_date = $1
            WHERE productions_users.production_id = $2 
            AND users.role = 1
            AND attendance.user_id IS NULL`,
            [todayLocal, productionId]
        );

        if (!absentStudentsResult || absentStudentsResult.rows.length === 0) {
            return res.status(400).json({ error: "No non-responders provided" });
        }

        const userIds = absentStudentsResult.rows.map(row => row.user_id);

        const emailResult = await pool.query(
            `SELECT email from users
            WHERE users.id = ANY($1)`,
            [userIds]
        )

        //console.log("Sending reminder emails to:", emailResult.rows);

        await sendReminderEmails(emailResult.rows);
        return res.json({ message: "Emails sent successfully!", people: emailResult.rows });
    } catch (error) {
        return res.status(500).json({ error: "Failed to send emails" });
    }
});