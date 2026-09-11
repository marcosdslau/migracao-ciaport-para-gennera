const Sequelize = require('sequelize');
const connection = require('../../database/database');

const Model = connection.define('tb_itens', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  id_item: {
    type: Sequelize.STRING,
  },
  description: {
    type: Sequelize.STRING,
  },
  type: {
    type: Sequelize.STRING,
  },
  period: {
    type: Sequelize.STRING,
  },
  price: {
    type: Sequelize.STRING,
  },
  status: {
    type: Sequelize.STRING,
  },
  cost_center: {
    type: Sequelize.STRING,
  },
  category: {
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