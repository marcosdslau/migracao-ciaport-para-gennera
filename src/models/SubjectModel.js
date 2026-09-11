const Sequelize = require('sequelize');
const connection = require('../../database/database');

const Model = connection.define('tb_subjects', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  id_subject: {
    type: Sequelize.STRING,
  },
  name: {
    type: Sequelize.STRING,
  },
  index: {
    type: Sequelize.STRING,
  },
  credit: {
    type: Sequelize.STRING,
  },
  required: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  workload: {
    type: Sequelize.STRING,
  },
  remote_workload: {
    type: Sequelize.STRING,
  },
  code: {
    type: Sequelize.STRING,
  },
  extension: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  extension_attendance_workload: {
    type: Sequelize.STRING,
  },
  experience_workload: {
    type: Sequelize.STRING,
  },
  theory_workload: {
    type: Sequelize.STRING,
  },
  match_subject_by_code: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  id_module: {
    type: Sequelize.STRING,
  },
  id_parent_subject: {
    type: Sequelize.STRING,
  },
  blended: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  hybrid: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  internship: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  nomeCurso: {
    type: Sequelize.STRING,
  },
  // new_id_subject: {
  //   type: Sequelize.STRING,
  // },
  
  createdAt: {
    type: Sequelize.DATE
  },
  updatedAt: {
    type: Sequelize.DATE
  },
});
//Model.sync({ force: true });
module.exports = Model;