const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Exports connection to database for other backend files
module.exports = { pool };