const Sequelize = require('sequelize');
const connection = require('../../database/database');

const Model = connection.define('tb_notifications', {
    idNotification: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    icon: {
        type: Sequelize.JSON,
        allowNull: false,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    startDate: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    endDate: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    content: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    active: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
    createdAt: {
        type: Sequelize.DATE
    },
    updatedAt: {
        type: Sequelize.DATE
    },
});

module.exports = Model;