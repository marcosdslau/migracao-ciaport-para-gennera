'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tb_enrollments_records', 'isImported', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    });

  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn('tb_enrollments_records', 'isImported');
  }
};