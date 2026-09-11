require('dotenv').config();
const Sequelize = require('sequelize');

const connectionSQLServessr = new Sequelize(process.env.DB_MIG_NAME, process.env.DB_MIG_USER, process.env.DB_MIG_PWD, {
    host: process.env.DB_MIG_HOST,
    dialect: process.env.DB_MIG_DIALECT,
    port: process.env.DB_MIG_PORT,
    //timezone: process.env.DB_MIG_TIMEZONE,
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

const connectionSQLServer = new Sequelize(process.env.DB_MIG_NAME, process.env.DB_MIG_USER, process.env.DB_MIG_PWD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,
    timezone: process.env.DB_TIMEZONE,
    logging: false,
});


module.exports = connectionSQLServer;