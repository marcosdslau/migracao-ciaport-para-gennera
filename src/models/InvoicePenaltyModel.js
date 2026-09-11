const Sequelize = require('sequelize');
const connection = require('../../database/database');

const Model = connection.define('tb_invoice_penalties', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  id_penalty: {
    type: Sequelize.STRING,
  },
  id_invoice: {
    type: Sequelize.STRING,
  },
  amount: {
    type: Sequelize.STRING,
  },
  percentage: {
    type: Sequelize.STRING,
  },
  base_amount: {
    type: Sequelize.STRING,
  },
  numero_carga: {
        type: Sequelize.STRING,
        defaultValue: '1'
    },
  
  createdAt: {
    type: Sequelize.DATE
  },
  updatedAt: {
    type: Sequelize.DATE
  },
});
//Model.sync({ force: true });
module.exports = Model;