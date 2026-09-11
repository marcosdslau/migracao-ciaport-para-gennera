const Sequelize = require('sequelize');
const connection = require('../../database/database');

const Model = connection.define('tb_users', {
    idUser: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    status: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    master: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    operador: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    view: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    createdAt: {
        type: Sequelize.DATE
    },
    updatedAt: {
        type: Sequelize.DATE
    },
});

module.exports = Model;