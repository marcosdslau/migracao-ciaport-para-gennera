'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tb_curriculums', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      id_course: {
        type: Sequelize.STRING,
      },
      id_curriculum: {
        type: Sequelize.STRING,
      },
      max_duration_enrollment: {
        type: Sequelize.STRING,
      },
      max_workload_enrollment: {
        type: Sequelize.STRING,
      },
      min_workload_required: {
        type: Sequelize.STRING,
      },
      min_workload_elective: {
        type: Sequelize.STRING,
      },
      min_workload_enrollment: {
        type: Sequelize.STRING,
      },
      min_workload_optional: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      search: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      workload_complementary_activity: {
        type: Sequelize.STRING,
      },
      extension_curricular_workload: {
        type: Sequelize.STRING,
      },
      workload_duration: {
        type: Sequelize.STRING,
        defaultValue: '50'
      },
      nomeCurso: {
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
    await queryInterface.dropTable('tb_curriculums');
  }
};