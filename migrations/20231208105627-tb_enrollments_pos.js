'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tb_enrollments_pos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      id_student: {
        type: Sequelize.STRING,
      },
      id_enrollment: {
        type: Sequelize.STRING,
      },
      code: {
        type: Sequelize.STRING,
      },
      academic_responsible_person_cpf: {
        type: Sequelize.STRING,
      },
      financial_responsible_person_document: {
        type: Sequelize.STRING,
      },
      academic_calendar: {
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
      class: {
        type: Sequelize.STRING,
      },
      shift: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING,
      },
      id_campaign: {
        type: Sequelize.STRING,
      },
      campaign: {
        type: Sequelize.STRING,
      },
      polo: {
        type: Sequelize.STRING,
      },
      date_enrollment: {
        type: Sequelize.STRING,
      },
      start_date: {
        type: Sequelize.STRING,
      },
      cancellation_reason: {
        type: Sequelize.STRING,
      },
      cancellation_date: {
        type: Sequelize.STRING,
      },
      observation: {
        type: Sequelize.STRING,
      },
      id_parent_enrollment: {
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
    await queryInterface.dropTable('tb_enrollments_pos');
  }
};