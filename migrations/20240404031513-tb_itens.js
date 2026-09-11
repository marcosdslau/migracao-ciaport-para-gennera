'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tb_itens', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      id_item: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.STRING,
      },
      period: {
        type: Sequelize.STRING,
      },
      price: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING,
      },
      cost_center: {
        type: Sequelize.STRING,
      },
      category: {
        type: Sequelize.STRING,
      },
      search: {
        type: Sequelize.BOOLEAN,
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
    await queryInterface.dropTable('tb_itens');
  }
};