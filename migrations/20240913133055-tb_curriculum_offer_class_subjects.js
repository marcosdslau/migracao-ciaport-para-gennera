'use strict';
//idClass: '', startDate: '',  vacancies: '', complementName: '', disregardGrade: '', idSubjectOffer: '', idSubject: ''
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tb_curriculum_offer_class_subjects', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      id_subject_offer: {
        type: Sequelize.STRING,
      },
      id_class: {
        type: Sequelize.STRING,
      },
      id_subject: {
        type: Sequelize.STRING,
      },
      start_date: {
        type: Sequelize.STRING,
      },
      complement_name: {
        type: Sequelize.STRING,
      },
      disregard_grade: {
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
    await queryInterface.dropTable('tb_curriculum_offer_class_subjects');
  }
};