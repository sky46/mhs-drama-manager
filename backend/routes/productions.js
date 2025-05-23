const Router = require('express-promise-router');
require('dotenv').config()
const { pool } = require('../db');  // Import the database connection
const { getUserRole, localDateFormat } = require('../helpers');


const router = new Router();
module.exports = router;

/**
 * Authenticated route.
 * Get list of productions with data.
 * 
 * URL params
 *  - productionId: production ID.
 * Response
 *  - productions: List of production objects containing production info, teacher list, and number of students.
 *  - role: Role of currently logged in user.
 */
router.get('/productions', async (req, res) => {
    const userId = req.session.user;
    if (!userId) {
        return res.status(401).json({ error: "Not logged in" });
    } 
    
    try {
        const roleId = await getUserRole(userId);

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
            return res.status(200).json({ productions: [], teachers: [], role: roleId });
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
        return res.status(200).json({ productions: productionsWithTeachersAndStudents, role: roleId });
    } catch (error) {
        console.error("Database query error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

/**
 * Teacher route.
 * Create a new production.
 * 
 * POST data
 *  - name: Production name.
 *  - teachers: List of teacher IDs to be added to production.
 *  - students: List of student IDs to be added to production.
 * Response
 *  - productionId: ID of created production.
 */
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

        // check first to make sure no production already named this
        const existingProduction = await client.query(
            'SELECT id FROM productions WHERE name = $1',
            [name]
        );
        if (existingProduction.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "A production with this name already exists.", exists: true });
        }

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
                [productionId, user.value],
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

/**
 * Teacher route.
 * Delete a production.
 * 
 * POST data
 *  - productionId: ID of production to delete.
 * Response
 *  - productionId: ID of deleted production.
 */
router.post('/productions/delete', async (req, res) => {
    const userId = req.session.user;
    if (!userId) {
        return res.status(401).json({ error: "Not logged in" });
    }
    // check if user is teacher
    const role = await getUserRole(userId);
    if (role !== 0) {
        return res.status(403).json({ error: "Missing permissions "});
    }

    const productionId = req.body.productionId;
    if (!productionId) {
        return res.status(400).json({ error: "Missing productionId in request body" });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // check if part of production
        const accessResult = await client.query(
            `SELECT productions.id
             FROM productions
             JOIN productions_users ON productions.id = productions_users.production_id
             WHERE productions_users.production_id = $1 AND productions_users.user_id = $2`,
            [productionId, userId]
        );
        if (accessResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(401).json({ error: 'User is not a part of production' });
        }

        // deleting this deletes other places because of fk
        await client.query(
            'DELETE FROM productions_users WHERE production_id = $1',
            [productionId]
        );

        await client.query(
            'DELETE FROM productions WHERE id = $1',
            [productionId]
        );

        await client.query('COMMIT');
        res.status(200).json({ message: "Production deleted successfully", productionId: productionId });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    } finally {
        client.release();
    }
});

/**
 * Teacher route.
 * Get a list of students and a list of teachers available to be added when creating a production.
 * This includes all students, and all teachers except for currently logged in teacher who will
 * automaticcally be added to production.
 * 
 * Response
 *  - teachers: List of available teachers.
 *  - students: List of available students.
 */
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

/**
 * Authenticated route.
 * Get production data.
 * Data accessible is different depending on user role.
 * 
 * URL params
 *  - productionId: production ID.
 * Response
 *  - role: User role.
 *  - productionData: Production data object containing:
 *      Available for all users:
 *          - id: ID.
 *          - name: Name.
 *          - teachers: List of teachers.
 *          - studentCount: Number of students.
 *      Available for teachers only:
 *          - attendance: Today's attendance for all students.
 *      Available for students only:
 *          - selfAttendanceHistory: Student's own attendance history.
 *          - selfMarkedPresent: Whether or not student has been marked present today.
 */
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
            JOIN productions_users ON productions.id = productions_users.production_id
            WHERE productions_users.production_id = $1 AND productions_users.user_id = $2`,
            [productionId, userId]
        );
        if (accessResult.rows.length === 0) {
            return res.status(401).json({ error: 'User is not a part of production'});
        }

        const teachersResult = await pool.query(
            `SELECT users.id, users.name
            FROM users
            JOIN productions_users ON users.id = productions_users.user_id
            WHERE productions_users.production_id = $1 AND users.role = 0;`,
            [productionId]
        );

        const todayFormatted = localDateFormat.format(new Date());
        var attendance, studentCount, selfAttendanceHistory, selfMarkedPresent;
        
        if (role === 0) {
            // Teacher
            const 
            
            presentStudentsResult = await pool.query(
                `SELECT users.id, users.name
                FROM users
                JOIN productions_users 
                    ON users.id = productions_users.user_id
                JOIN attendance 
                    ON users.id = attendance.user_id 
                    AND attendance.production_id = $1 
                    AND attendance.attendance_date = $2
                WHERE productions_users.production_id = $1
                AND users.role = 1
                `,
                [productionId, todayFormatted]
            );
            const absentStudentsResult = await pool.query(
                `SELECT users.id, users.name
                FROM users
                JOIN productions_users 
                    ON users.id = productions_users.user_id
                LEFT JOIN attendance 
                    ON users.id = attendance.user_id 
                    AND attendance.production_id = $1 
                    AND attendance.attendance_date = $2
                WHERE productions_users.production_id = $1
                AND attendance.user_id IS NULL
                AND users.role = 1`,
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
                JOIN productions_users ON users.id = productions_users.user_id
                WHERE productions_users.production_id = $1 AND users.role = 1`,
                [productionId]
            );
            studentCount = studentCountResult.rows[0].count;
            
            selfMarkedPresent = selfAttendanceHistory.some(
                (row) => localDateFormat.format(row.attendance_date) === todayFormatted
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

/**
 * Teacher route.
 * Get existing data for production as well as available students and teachers to be added.
 * Available students and teachers contains all students and all teachers except currently logged in teacher,
 * who will be automatically added.
 * 
 * URL params
 *  - productionId: production ID.
 * Response
 *  - production: Production object including:
 *      - id: ID.
 *      - name: Name.
 *      - currentTeachers: IDs and names of teachers who are currently part of production.
 *      - allTeachers: IDs of all teachers except currently logged in teacher.
 *      - currentStudents: IDs and names of teachers who are currently part of production.
 *      - allStudents: IDs of all students.
 */
router.get('/productions/:productionId/getEditData', async (req, res) => {
    const userId = req.session.user;
    if (!userId) {
        return res.status(401).json({ error: "Not logged in" });
    }
    const productionId = req.params.productionId;

    try {
        const role = await getUserRole(userId);
        if (role !== 0) {
            return res.status(403).json({ error: "Only teachers can edit productions" })
        }
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
            JOIN productions_users ON productions.id = productions_users.production_id
            WHERE productions_users.production_id = $1 AND productions_users.user_id = $2`,
            [productionId, userId]
        );
        if (accessResult.rows.length === 0) {
            return res.status(401).json({ error: 'User is not a part of production'});
        }

        // Exclude teacher making request because they are automatically part of production
        const currentTeachersResult = await pool.query(
            `SELECT users.id, users.name
            FROM users
            JOIN productions_users ON users.id = productions_users.user_id
            WHERE users.role = 0 AND productions_users.production_id = $1 AND users.id <> $2`,
            [productionId, userId]
        );
        const allTeachersResult = await pool.query(
            `SELECT id, name
            FROM users
            WHERE users.role = 0 AND users.id <> $1`,
            [userId]
        );
        const currentStudentsResult = await pool.query(
            `SELECT users.id, users.name
            FROM users
            JOIN productions_users ON users.id = productions_users.user_id
            WHERE users.role = 1 AND productions_users.production_id = $1`,
            [productionId]
        );
        const allStudentsResult = await pool.query(
            `SELECT id, name
            FROM users
            WHERE users.role = 1`,
        );

        return res.status(200).json({
            production: {
                ...(productionResult.rows[0]),
                currentTeachers: currentTeachersResult.rows,
                allTeachers: allTeachersResult.rows,
                currentStudents: currentStudentsResult.rows,
                allStudents: allStudentsResult.rows,
            }
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
})

/**
 * Teacher route.
 * Edit a production.
 * 
 * URL params
 *  - productionId: production ID.
 * POST data:
 *  - name: New name.
 *  - teachers: New list of teacher IDs to be part of production.
 *  - students: New list of student IDs to be part of production.
 * Response
 *  - productionID: production ID.
 */
router.post('/productions/:productionId/edit', async (req, res) => {
    const userId = req.session.user;
    if (!userId) {
        return res.status(401).json({ error: "Not logged in" });
    }
    // Check if user is teacher
    const role = await getUserRole(userId);
    if (role !== 0) {
        return res.status(403).json({ error: "Missing permissions "});
    }

    const productionId = req.params.productionId;

    const accessResult = await pool.query(
        `SELECT productions.id
        FROM productions
        JOIN productions_users ON productions.id = productions_users.production_id
        WHERE productions_users.production_id = $1 AND productions_users.user_id = $2`,
        [productionId, userId]
    );
    if (accessResult.rows.length === 0) {
        return res.status(401).json({ error: 'User is not a part of production'});
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const {name, teachers, students} = req.body;
        await client.query(
            'UPDATE productions SET name = $1 WHERE id = $2',
            [name, productionId],
        );
        // Remove all users from production, except editing user who will be added by default
        await client.query(
            'DELETE FROM productions_users WHERE production_id = $1 AND user_id <> $2',
            [productionId, userId],
        );
        // Add updated users to production
        for (const user of teachers.concat(students)) {
            await client.query(
                'INSERT INTO productions_users (production_id, user_id) VALUES ($1, $2)',
                [productionId, user.value],
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
