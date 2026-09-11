'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tb_invoice_discounts', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      id_discount: {
        type: Sequelize.STRING,
      },
      id_invoice: {
        type: Sequelize.STRING,
      },
      id_type_discount: {
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.STRING,
      },
      event: {
        type: Sequelize.STRING,
      },
      amount: {
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
    await queryInterface.dropTable('tb_invoice_discounts');
  }
};