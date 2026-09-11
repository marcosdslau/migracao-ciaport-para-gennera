'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tb_payments', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      id_payment: {
        type: Sequelize.STRING,
      },
      id_invoice: {
        type: Sequelize.STRING,
      },
      id_payable: {
        type: Sequelize.STRING,
      },
      id_person: {
        type: Sequelize.STRING,
      },
      payment_method: {
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING,
      },
      amount: {
        type: Sequelize.STRING,
      },
      payment_date: {
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
    await queryInterface.dropTable('tb_payments');
  }
};