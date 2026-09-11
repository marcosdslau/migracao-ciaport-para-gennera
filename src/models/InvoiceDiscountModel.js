const Sequelize = require('sequelize');
const connection = require('../../database/database');

const Model = connection.define('tb_invoice_discounts', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  id_discount: {
    type: Sequelize.STRING,
  },
  id_invoice: {
    type: Sequelize.STRING,
  },
  id_type_discount: {
    type: Sequelize.STRING,
  },
  type: {
    type: Sequelize.STRING,
  },
  event: {
    type: Sequelize.STRING,
  },
  amount: {
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