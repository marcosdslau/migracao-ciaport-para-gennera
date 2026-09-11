const Sequelize = require('sequelize');
const connection = require('../../database/database');

const Model = connection.define('integrate_configs', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    urlApi: {
        type: Sequelize.TEXT,
    },
    intitutionCode: {
        type: Sequelize.TEXT,
    },
    tokenApi: {
        type: Sequelize.TEXT,
    },
    ///Catraca 1
    name_catraca_1: {
        type: Sequelize.STRING,
    },
    catraca_1: {
        type: Sequelize.STRING,
    },
    user_catraca_1: {
        type: Sequelize.STRING,
    },
    pass_catraca_1: {
        type: Sequelize.STRING,
    },
    ///Catraca 2
    name_catraca_2: {
        type: Sequelize.STRING,
    },
    catraca_2: {
        type: Sequelize.STRING,
    },
    user_catraca_2: {
        type: Sequelize.STRING,
    },
    pass_catraca_2: {
        type: Sequelize.STRING,
    },
    ///Catraca 3
    name_catraca_3: {
        type: Sequelize.STRING,
    },
    catraca_3: {
        type: Sequelize.STRING,
    },
    user_catraca_3: {
        type: Sequelize.STRING,
    },
    pass_catraca_3: {
        type: Sequelize.STRING,
    },
    ///Catraca 4
    name_catraca_4: {
        type: Sequelize.STRING,
    },
    catraca_4: {
        type: Sequelize.STRING,
    },
    user_catraca_4: {
        type: Sequelize.STRING,
    },
    pass_catraca_4: {
        type: Sequelize.STRING,
    },
    ///Catraca 5
    name_catraca_5: {
        type: Sequelize.STRING,
    },
    catraca_5: {
        type: Sequelize.STRING,
    },
    user_catraca_5: {
        type: Sequelize.STRING,
    },
    pass_catraca_5: {
        type: Sequelize.STRING,
    },
    ///Catraca 6
    name_catraca_6: {
        type: Sequelize.STRING,
    },
    catraca_6: {
        type: Sequelize.STRING,
    },
    user_catraca_6: {
        type: Sequelize.STRING,
    },
    pass_catraca_6: {
        type: Sequelize.STRING,
    },
    createdAt: {
        type: Sequelize.DATE
    },
    updatedAt: {
        type: Sequelize.DATE
    },
});

// Model.sync({ force: true });

module.exports = Model;