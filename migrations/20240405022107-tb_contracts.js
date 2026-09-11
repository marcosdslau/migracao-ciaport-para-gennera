'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tb_contracts', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      id_contract: {
        type: Sequelize.STRING,
      },
      financial_responsible_person_document: {
        type: Sequelize.STRING,
      },
      id_enrollment: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING,
      },
      due_date: {
        type: Sequelize.STRING,
      },
      details: {
        type: Sequelize.STRING,
      },
      observation: {
        type: Sequelize.STRING,
      },
      value: {
        type: Sequelize.STRING,
      },
      method: {
        type: Sequelize.STRING,
      },
      percentage: {
        type: Sequelize.STRING,
      },
      amount: {
        type: Sequelize.STRING,
      },
      calculation_base: {
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
    await queryInterface.dropTable('tb_contracts');
  }
};