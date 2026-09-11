const Sequelize = require('sequelize');
const connection = require('../../database/database');

const Model = connection.define('tb_teaching_plans', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  id_subject: {
    type: Sequelize.STRING,
  },
  id_syllabus: {
    type: Sequelize.STRING,
  },
  syllabus: {
    type: Sequelize.TEXT,
  },
  goals: {
    type: Sequelize.TEXT,
  },
  program_content: {
    type: Sequelize.TEXT,
  },
  methodology_approach: {
    type: Sequelize.TEXT,
  },
  evaluation_process: {
    type: Sequelize.TEXT,
  },
  bibliographic_reference: {
    type: Sequelize.TEXT,
  },
  complementary_biblographic: {
    type: Sequelize.TEXT,
  },
  skills_and_competences: {
    type: Sequelize.TEXT,
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