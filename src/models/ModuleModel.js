const Sequelize = require('sequelize');
const connection = require('../../database/database');

const Model = connection.define('tb_modules', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  id_module: {
    type: Sequelize.STRING,
  },
  name: {
    type: Sequelize.STRING,
  },
  index: {
    type: Sequelize.STRING,
  },
  search: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  id_curriculum: {
    type: Sequelize.STRING,
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