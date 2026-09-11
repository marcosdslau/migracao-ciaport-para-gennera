const Sequelize = require('sequelize');
const connection = require('../../database/database');

const Model = connection.define('tb_enrollments_records_subjects', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  id_enrollment_subject_record: {
    type: Sequelize.STRING,
  },
  id_enrollment_subject_record_aux: {
    type: Sequelize.STRING,
  },
  id_enrollment_record: {
    type: Sequelize.STRING,
  },
  subject: {
    type: Sequelize.STRING,
  },
  academic_calendar: {
    type: Sequelize.STRING,
  },
  subject_group: {
    type: Sequelize.STRING,
  },
  subject_type: {
    type: Sequelize.STRING,
  },
  subject_area: {
    type: Sequelize.STRING,
  },
  average_grade: {
    type: Sequelize.STRING
  },
  attendance: {
    type: Sequelize.STRING,
  },
  workload: {
    type: Sequelize.STRING,
  },
  total_absences: {
    type: Sequelize.STRING,
  },
  hours_absence: {
    type: Sequelize.STRING,
  },
  waiver: {
    type: Sequelize.STRING,
  },
  achievement_test_grade: {
    type: Sequelize.STRING,
  },
  status: {
    type: Sequelize.STRING,
  },
  complementary_status: {
    type: Sequelize.STRING
  },
  letter_grade: {
    type: Sequelize.STRING
  },
  cancellation_reason: {
    type: Sequelize.STRING,
  },
  obs: {
    type: Sequelize.STRING,
  },
  dismissed: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },  
  dismissal_reason: {
    type: Sequelize.STRING,
  },  
  failure_reason: {
    type: Sequelize.STRING,
  },  
  course_name_equivalence: {
    type: Sequelize.STRING,
  },  
  curriculum_name_equivalence: {
    type: Sequelize.STRING,
  },  
  module_name_equivalence: {
    type: Sequelize.STRING,
  },  
  subject_name_equivalence: {
    type: Sequelize.STRING,
  },  
  internship: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },  
  internship_start_date: {
    type: Sequelize.STRING,
  },  
  internship_end_date: {
    type: Sequelize.STRING,
  },  
  segunda_carga: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  
  createdAt: {
    type: Sequelize.DATE
  },
  updatedAt: {
    type: Sequelize.DATE
  },
});

module.exports = Model;