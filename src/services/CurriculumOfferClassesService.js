
const CurriculumOfferClassesRepository = require('../repository/CurriculumOfferClassesRepository');
const connection = require('../../database/database')

class CurriculumOfferClassesService {

    constructor(){

    }

    async Registra(id_class, id_curriculum_offer, id_module, name, start_date, end_date, shift, inep_code, physical_location){
        let beginTransaction = await connection.transaction();
        let curriculumOfferClassesRepository = new CurriculumOfferClassesRepository(beginTransaction);
        try {
            let alreadExist = await curriculumOfferClassesRepository.BuscarPeloId(id_class);
            if(!alreadExist) await curriculumOfferClassesRepository.criarRegistro(id_class, id_curriculum_offer, id_module, name, start_date, end_date, shift, inep_code, physical_location);
            else await curriculumOfferClassesRepository.atualizarRegistro(id_class, id_curriculum_offer, id_module, name, start_date, end_date, shift, inep_code, physical_location);

            await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            await beginTransaction.rollback();
        }
    }

    async BuscaTodos(){
        let curriculumOfferClassesRepository = new CurriculumOfferClassesRepository();
        try {
            const Filiations = await curriculumOfferClassesRepository.BuscarTodas();
            return Filiations;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloId(id_class){
        let curriculumOfferClassesRepository = new CurriculumOfferClassesRepository();
        try {
            const dados = await curriculumOfferClassesRepository.BuscarPeloId(id_class);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = CurriculumOfferClassesService;