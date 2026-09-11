const Sequelize = require('sequelize');
const connection = require('../../database/database');

const Model = connection.define('tb_enrollments_records_subject_professors', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  id_enrollment_subject_record_professor: {
    type: Sequelize.STRING,
  },
  id_enrollment_subject_record_professor_aux: {
    type: Sequelize.STRING,
  },
  id_enrollment_subject_record: {
    type: Sequelize.STRING,
  },
  professor_name: {
    type: Sequelize.STRING,
  },
  academic_title: {
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