'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tb_invoice_penalties', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      id_penalty: {
        type: Sequelize.STRING,
      },
      id_invoice: {
        type: Sequelize.STRING,
      },
      amount: {
        type: Sequelize.STRING,
      },
      percentage: {
        type: Sequelize.STRING,
      },
      base_amount: {
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
    await queryInterface.dropTable('tb_invoice_penalties');
  }
};