
const CurriculumOfferClassesSubjectRepository = require('../repository/CurriculumOfferClassesSubjectRepository');
const connection = require('../../database/database')

class CurriculumOfferClassesSubjectService {

    constructor(){

    }

    async Registra(id_subject_offer, id_class, id_subject, start_date, complement_name, disregard_grade){
        let beginTransaction = await connection.transaction();
        let curriculumOfferClassesSubjectRepository = new CurriculumOfferClassesSubjectRepository(beginTransaction);
        try {
            let alreadExist = await curriculumOfferClassesSubjectRepository.BuscarPeloId(id_subject_offer);
            if(!alreadExist) await curriculumOfferClassesSubjectRepository.criarRegistro(id_subject_offer, id_class, id_subject, start_date, complement_name, disregard_grade);
            else await curriculumOfferClassesSubjectRepository.atualizarRegistro(id_subject_offer, id_class, id_subject, start_date, complement_name, disregard_grade);

            await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            await beginTransaction.rollback();
        }
    }

    async BuscaTodos(){
        let curriculumOfferClassesSubjectRepository = new CurriculumOfferClassesSubjectRepository();
        try {
            const Filiations = await curriculumOfferClassesSubjectRepository.BuscarTodas();
            return Filiations;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloId(id_class){
        let curriculumOfferClassesSubjectRepository = new CurriculumOfferClassesSubjectRepository();
        try {
            const dados = await curriculumOfferClassesSubjectRepository.BuscarPeloId(id_class);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = CurriculumOfferClassesSubjectService;