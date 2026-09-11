const Sequelize = require('sequelize');
const connection = require('../../database/database');

const Model = connection.define('tb_courses', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  id_course: {
    type: Sequelize.STRING,
  },
  name: {
    type: Sequelize.STRING,
  },
  code: {
    type: Sequelize.STRING,
  },
  level: {
    type: Sequelize.STRING,
  },
  type: {
    type: Sequelize.STRING,
  },
  coordinator: {
    type: Sequelize.STRING,
  },
  grade: {
    type: Sequelize.STRING,
  },
  secretary: {
    type: Sequelize.STRING,
  },
  secretary_subscription: {
    type: Sequelize.STRING,
  },
  authorization: {
    type: Sequelize.STRING,
  },
  recognition: {
    type: Sequelize.STRING,
  },
  code_inep: {
    type: Sequelize.STRING,
  },
  modality: {
    type: Sequelize.STRING,
  },
  search: {
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
//Model.sync({ force: true });
module.exports = Model;