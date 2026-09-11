const Sequelize = require('sequelize');
const connection = require('../../database/database');

const Model = connection.define('tb_payments', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  id_payment: {
    type: Sequelize.STRING,
  },
  id_invoice: {
    type: Sequelize.STRING,
  },
  id_payable: {
    type: Sequelize.STRING,
  },
  id_person: {
    type: Sequelize.STRING,
  },
  payment_method: {
    type: Sequelize.STRING,
  },
  type: {
    type: Sequelize.STRING,
  },
  status: {
    type: Sequelize.STRING,
  },
  amount: {
    type: Sequelize.STRING,
  },
  payment_date: {
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