const Sequelize = require('sequelize');
const connection = require('../../database/database');

const Model = connection.define('tb_invoices', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  id_purchase: {
    type: Sequelize.STRING,
  },
  id_invoice: {
    type: Sequelize.STRING,
  },
  id_invoice_aux: {
    type: Sequelize.STRING,
  },
  month_cycle: {
    type: Sequelize.STRING,
  },
  year_cycle: {
    type: Sequelize.STRING,
  },
  due_date: {
    type: Sequelize.STRING,
  },
  amount: {
    type: Sequelize.STRING,
  },
  debt_collection: {
    type: Sequelize.STRING,
  },
  isManual: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
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