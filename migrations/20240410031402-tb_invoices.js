'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tb_invoices', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      id_purchase: {
        type: Sequelize.STRING,
      },
      id_invoice: {
        type: Sequelize.STRING,
      },
      id_invoice_aux: {
        type: Sequelize.STRING,
      },
      month_cycle: {
        type: Sequelize.STRING,
      },
      year_cycle: {
        type: Sequelize.STRING,
      },
      due_date: {
        type: Sequelize.STRING,
      },
      amount: {
        type: Sequelize.STRING,
      },
      debt_collection: {
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
    await queryInterface.dropTable('tb_invoices');
  }
};