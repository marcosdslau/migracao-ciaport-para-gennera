
const FiliationRepository = require('../repository/FiliationRepository');
const connection = require('../../database/database')

class FiliationService {

    constructor(){

    }

    async RegistraFiliation(id_person, id_student, relationship, is_financial_responsible){
        let beginTransaction = await connection.transaction();
        let filiationRepository = new FiliationRepository(beginTransaction);
        try {
            let alreadExist = await filiationRepository.BuscarFiliacaoPeloIdPerson(id_person, id_student);
            if(!alreadExist) await filiationRepository.criarFiliacao(id_person, id_student, relationship, is_financial_responsible);
            else await filiationRepository.atualizarFiliacao(id_person, id_student, relationship, is_financial_responsible);

            await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            await beginTransaction.rollback();
        }
    }

    async BuscaTodasFiliations(){
        let filiationRepository = new FiliationRepository();
        try {
            const Filiations = await filiationRepository.BuscarTodasFiliacaoes();
            return Filiations;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPessoaPeloIdPerson(id_person){
        let filiacaoRepository = new FiliationRepository();
        try {
            const pessoa = await filiacaoRepository.BuscarFiliacaoPeloIdPerson(id_person);
            return pessoa;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = FiliationService;