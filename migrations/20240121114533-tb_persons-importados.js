'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tb_persons', 'isImported', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    });

  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn('tb_persons', 'isImported');
  }
};