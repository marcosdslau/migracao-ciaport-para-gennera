'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tb_invoices', 'isManual', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    });

  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn('tb_invoices', 'isManual');
  }
};