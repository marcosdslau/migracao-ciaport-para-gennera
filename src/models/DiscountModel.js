const Sequelize = require('sequelize');
const connection = require('../../database/database');

const Model = connection.define('tb_discounts', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  id_type_discount: {
    type: Sequelize.STRING,
  },
  category: {
    type: Sequelize.STRING,
  },
  description: {
    type: Sequelize.STRING,
  },
  type: {
    type: Sequelize.STRING,
  },
  fiscal_type: {
    type: Sequelize.STRING,
  },
  condition: {
    type: Sequelize.STRING,
  },
  value: {
    type: Sequelize.STRING,
  },
  method: {
    type: Sequelize.STRING,
  },
  percentage: {
    type: Sequelize.STRING,
  },
  amount: {
    type: Sequelize.STRING,
  },
  calculation_base: {
    type: Sequelize.STRING,
  },
  search: {
    type: Sequelize.BOOLEAN,
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