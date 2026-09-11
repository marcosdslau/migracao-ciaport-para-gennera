const Sequelize = require('sequelize');
const connection = require('../../database/database');

const Model = connection.define('tb_curriculum_offers', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  id_curriculum_offer: {
    type: Sequelize.STRING,
  },
  id_academic_calendar: {
    type: Sequelize.STRING,
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