const pgp = require('pg-promise')();

const conString = 'postgres://quote_system:password@localhost:5432/quote_store';

const db = pgp(conString);

module.exports = db;