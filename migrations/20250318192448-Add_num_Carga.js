'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tb_contracts', 'numero_carga', {
        type: Sequelize.STRING,
        defaultValue: '1'
    });
    await queryInterface.addColumn('tb_puchases', 'numero_carga', {
        type: Sequelize.STRING,
        defaultValue: '1'
    });
    await queryInterface.addColumn('tb_invoices', 'numero_carga', {
      type: Sequelize.STRING,
      defaultValue: '1'
    });
    await queryInterface.addColumn('tb_invoice_discounts', 'numero_carga', {
      type: Sequelize.STRING,
      defaultValue: '1'
    });
    await queryInterface.addColumn('tb_invoice_penalties', 'numero_carga', {
      type: Sequelize.STRING,
      defaultValue: '1'
    });
    await queryInterface.addColumn('tb_payments', 'numero_carga', {
      type: Sequelize.STRING,
      defaultValue: '1'
    });

  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn('tb_contracts', 'numero_carga');
    queryInterface.removeColumn('tb_puchases', 'numero_carga');
    queryInterface.removeColumn('tb_invoices', 'numero_carga');
    queryInterface.removeColumn('tb_invoice_discounts', 'numero_carga');
    queryInterface.removeColumn('tb_invoice_penalties', 'numero_carga');
    queryInterface.removeColumn('tb_payments', 'numero_carga');
  }
};