require('dotenv').config();
const Sequelize = require('sequelize');

const connectionSQLServer = new Sequelize(process.env.DB_SQL_NAME, process.env.DB_SQL_USER, process.env.DB_SQL_PWD, {
    host: process.env.DB_SQL_HOST,
    dialect: process.env.DB_SQL_DIALECT,
    port: process.env.DB_SQL_PORT,
    //timezone: process.env.DB_SQL_TIMEZONE,
    logging: false,
    pool: {
        max: 30,
        min: 0,
        acquire: 220000,
        idle: 220000
    } ,
    dialectOptions: {
        options: {
            trustedConnection: true, // Use Trusted Connection
            requestTimeout: 220000,
            encrypt: true,
        }
    },
});


module.exports = connectionSQLServer;