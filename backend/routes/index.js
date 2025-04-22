const users = require('./users');
const productions = require('./productions');
const attendance = require('./attendance');

const mountRoutes = (app) => {
    app.use('/', users);
    app.use('/', productions);
    app.use('/', attendance);
}

module.exports = {mountRoutes};
