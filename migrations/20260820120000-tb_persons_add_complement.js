'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tb_persons', 'complement', {
        type: Sequelize.STRING,
    });

  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn('tb_persons', 'complement');
  }
};
