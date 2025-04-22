const {pool} = require('./db');


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
