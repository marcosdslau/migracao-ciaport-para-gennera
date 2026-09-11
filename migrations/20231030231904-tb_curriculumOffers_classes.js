'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tb_curriculum_offers_classes', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      id_class: {
        type: Sequelize.STRING,
      },
      id_curriculum_offer: {
        type: Sequelize.STRING,
      },
      id_module: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      start_date: {
        type: Sequelize.STRING,
      },
      end_date: {
        type: Sequelize.STRING,
      },
      shift: {
        type: Sequelize.STRING,
      },
      inep_code: {
        type: Sequelize.STRING,
      },
      physical_location: {
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
    await queryInterface.dropTable('tb_curriculum_offers_classes');
  }
};