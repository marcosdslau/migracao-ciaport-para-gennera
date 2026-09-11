const Sequelize = require('sequelize');
const connection = require('../../database/database');

const Model = connection.define('tb_enrollment_records_extension_activities', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  id_enrollment_complementary_activity_record: {
    type: Sequelize.STRING,
  },
  id_enrollment_complementary_activity_record_aux: {
    type: Sequelize.STRING,
  },
  id_enrollment_record: {
    type: Sequelize.STRING,
  },
  category: {
    type: Sequelize.STRING,
  },
  name: {
    type: Sequelize.STRING,
  },
  description: {
    type: Sequelize.STRING,
  },
  start_date: {
    type: Sequelize.STRING,
  },
  end_date: {
    type: Sequelize.STRING,
  },
  workload: {
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