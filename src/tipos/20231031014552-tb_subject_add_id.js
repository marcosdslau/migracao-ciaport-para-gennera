'use strict';

const SubjectRepository = require('../src/repository/SubjectRepository');
const listaDeDisciplinas = require('../src/tipos/novoIdDisciplina');

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('tb_subjects', 'new_id_subject', { type: Sequelize.STRING });
    const subjectRepository = new SubjectRepository();
    for(let disciplina of listaDeDisciplinas){
      let founded = await subjectRepository.BuscarPeloIdModuleEName(disciplina.idModule, disciplina.name);
      if(founded){
        console.log(`INSERINDO NOVO ID EM ${disciplina.name} (${founded.id_subject}) - ${disciplina.idSubject}`)
        await subjectRepository.atualizarRegistroNewIdSubject(founded.id_subject, disciplina.idSubject);
      }
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('tb_subjects', 'new_id_subject', { type: Sequelize.STRING });
  }
};
