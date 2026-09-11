
const TeachingPlanRepository = require('../repository/TeachingPlanRepository');
const connection = require('../../database/database')

class TeachingPlanService {

    constructor(){

    }

    async Registra(id_subject, id_syllabus, syllabus, goals, program_content, methodology_approach, evaluation_process, bibliographic_reference, complementary_biblographic, skills_and_competences){
        let beginTransaction = await connection.transaction();
        let teachingPlanRepository = new TeachingPlanRepository(beginTransaction);
        try {
            let alreadExist = await teachingPlanRepository.BuscarPeloId(id_subject);
            if(!alreadExist) await teachingPlanRepository.criarRegistro(id_subject, id_syllabus, syllabus, goals, program_content, methodology_approach, evaluation_process, bibliographic_reference, complementary_biblographic, skills_and_competences);
            else await teachingPlanRepository.atualizarRegistro(id_subject, id_syllabus, syllabus, goals, program_content, methodology_approach, evaluation_process, bibliographic_reference, complementary_biblographic, skills_and_competences);

            await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            await beginTransaction.rollback();
        }
    }

    async BuscaTodos(){
        let teachingPlanRepository = new TeachingPlanRepository();
        try {
            const Filiations = await teachingPlanRepository.BuscarTodas();
            return Filiations;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloId(id_subject){
        let teachingPlanRepository = new TeachingPlanRepository();
        try {
            const dados = await teachingPlanRepository.BuscarPeloId(id_subject);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = TeachingPlanService;