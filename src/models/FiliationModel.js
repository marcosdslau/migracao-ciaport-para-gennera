const Sequelize = require('sequelize');
const connection = require('../../database/database');

const Model = connection.define('tb_filiations', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      id_person: {
        type: Sequelize.STRING,
      },
      id_student: {
        type: Sequelize.STRING,
      },
      relationship: {
        type: Sequelize.STRING,
      },
      is_financial_responsible: {
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
//Model.sync({ alter: true });
module.exports = Model;