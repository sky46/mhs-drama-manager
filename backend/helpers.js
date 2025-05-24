const {pool} = require('./db');

/**
 * Get role of user from ID.
 * 
 * @param { number } id - User ID.
 * @returns { number? } The role of the user, or null if the user could not be found.
 */
async function getUserRole(id) {
    const queryResult = await pool.query(
        'SELECT role FROM USERS WHERE id = $1',
        [id]
    );
    if (queryResult.rows.length === 0) {
        return null;
    } else {
        return queryResult.rows[0].role;
    }
}

const localDateFormat = new Intl.DateTimeFormat('en-CA', {
    dateStyle: 'short',
    timeZone: 'America/Toronto'
});

module.exports = {getUserRole, localDateFormat};
