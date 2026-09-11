'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tb_puchases', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      id_contract: {
        type: Sequelize.STRING,
      },
      id_purchase: {
        type: Sequelize.STRING,
      },
      id_purchase_aux: {
        type: Sequelize.STRING,
      },
      id_person: {
        type: Sequelize.STRING,
      },
      id_item: {
        type: Sequelize.STRING,
      },
      installments: {
        type: Sequelize.STRING,
      },
      quantity: {
        type: Sequelize.STRING,
      },
      unit_price: {
        type: Sequelize.STRING,
      },
      date_start: {
        type: Sequelize.STRING,
      },
      date_end: {
        type: Sequelize.STRING,
      },
      date: {
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
    await queryInterface.dropTable('tb_puchases');
  }
};