'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tb_persons', 'higher_education_conclusion_course', {
        type: Sequelize.STRING,
    });
    await queryInterface.addColumn('tb_persons', 'higher_education_type_of_school', {
        type: Sequelize.STRING,
    });

  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn('tb_persons', 'higher_education_conclusion_course');
    queryInterface.removeColumn('tb_persons', 'higher_education_type_of_school');
  }
};