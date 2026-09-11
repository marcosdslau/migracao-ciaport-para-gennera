const Sequelize = require('sequelize');
const connection = require('../../database/database');

const Model = connection.define('tb_enrollments_subjects', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  id_enrollment: {
    type: Sequelize.STRING,
  },
  course: {
    type: Sequelize.STRING,
  },
  curriculum: {
    type: Sequelize.STRING,
  },
  module: {
    type: Sequelize.STRING,
  },
  subject: {
    type: Sequelize.STRING,
  },
  class: {
    type: Sequelize.STRING,
  },
  shift: {
    type: Sequelize.STRING,
  },
  type: {
    type: Sequelize.STRING,
  },
  status: {
    type: Sequelize.STRING,
  },
  cancellation_reason: {
    type: Sequelize.STRING,
  },
  credit: {
    type: Sequelize.STRING,
  },
  amount: {
    type: Sequelize.STRING,
  },
  polo: {
    type: Sequelize.STRING,
  },
  internship_start_date: {
    type: Sequelize.STRING,
  },
  internship_end_date: {
    type: Sequelize.STRING,
  },
  createdAt: {
    type: Sequelize.DATE
  },
  updatedAt: {
    type: Sequelize.DATE
  },
});

module.exports = Model;