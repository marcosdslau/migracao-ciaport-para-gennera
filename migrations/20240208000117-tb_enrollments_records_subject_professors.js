'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tb_enrollments_records_subject_professors', {
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

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tb_enrollments_records_subject_professors');
  }
};