const Sequelize = require('sequelize');
const connection = require('../../database/database');

const Model = connection.define('tb_pre_requisites', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  id_subject: {
    type: Sequelize.STRING,
  },
  id_subject_prerequisite: {
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