require('dotenv').config();
const pg = require('pg');
const conStringPri = 'postgres://' + process.env.DB_USER + ':' + process.env.DB_PWD + '@' + process.env.DB_HOST + '/postgres';

const Client = pg.Client;
const client = new Client({ connectionString: conStringPri });
client.connect();
client.query(`CREATE DATABASE ${process.env.DB_NAME}`)
    .then(() => client.end())
    .catch((err) => {
        if (err.code === '42P04') {
            console.log('Banco já existe');
            process.exit();
        } else {
            console.log(err)
            process.exit();
        }
    });