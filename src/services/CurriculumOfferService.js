
const CurriculumOfferRepository = require('../repository/CurriculumOfferRepository');
const connection = require('../../database/database')

class CurriculumOfferService {

    constructor(){

    }

    async Registra(id_curriculum_offer, id_academic_calendar, id_curriculum){
        let beginTransaction = await connection.transaction();
        let curriculumOfferRepository = new CurriculumOfferRepository(beginTransaction);
        try {
            let alreadExist = await curriculumOfferRepository.BuscarPeloId(id_curriculum_offer);
            if(!alreadExist) await curriculumOfferRepository.criarRegistro(id_curriculum_offer, id_academic_calendar, id_curriculum);
            else await curriculumOfferRepository.atualizarRegistro(id_curriculum_offer, id_academic_calendar, id_curriculum);

            await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            await beginTransaction.rollback();
        }
    }

    async BuscaTodos(){
        let curriculumOfferRepository = new CurriculumOfferRepository();
        try {
            const Filiations = await curriculumOfferRepository.BuscarTodas();
            return Filiations;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloId(id_curriculum_offer){
        let curriculumOfferRepository = new CurriculumOfferRepository();
        try {
            const dados = await curriculumOfferRepository.BuscarPeloId(id_curriculum_offer);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = CurriculumOfferService;