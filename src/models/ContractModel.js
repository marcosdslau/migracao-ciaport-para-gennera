const Sequelize = require('sequelize');
const connection = require('../../database/database');

const Model = connection.define('tb_contracts', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  id_contract: {
    type: Sequelize.STRING,
  },
  id_contract_aux: {
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
  numero_carga: {
    type: Sequelize.STRING,
    defaultValue: '1'
  },
  
  createdAt: {
    type: Sequelize.DATE
  },
  updatedAt: {
    type: Sequelize.DATE
  },
});
//Model.sync({ force: true });
module.exports = Model;