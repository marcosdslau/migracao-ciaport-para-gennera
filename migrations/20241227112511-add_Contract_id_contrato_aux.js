'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tb_contracts', 'id_contract_aux', {
        type: Sequelize.STRING,
    });

  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn('tb_contracts', 'id_contract_aux');
  }
};