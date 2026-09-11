
const CurriculumRepository = require('../repository/CurriculumRepository');
const connection = require('../../database/database')

class CurriculoService {

    constructor(){

    }

    async Registra(id_course, id_curriculum, name, max_duration_enrollment, max_workload_enrollment, min_duration_enrollment, min_workload_elective, min_workload_enrollment, min_workload_optional, min_workload_required, search, workload_complementary_activity, extension_curricular_workload, workload_duration, nomeCurso){
        let beginTransaction = await connection.transaction();
        let curriculumRepository = new CurriculumRepository(beginTransaction);
        try {
            let alreadExist = await curriculumRepository.BuscarPeloId(id_curriculum);
            if(!alreadExist) await curriculumRepository.criarRegistro(id_course, id_curriculum, name, max_duration_enrollment, max_workload_enrollment, min_duration_enrollment, min_workload_elective, min_workload_enrollment, min_workload_optional, min_workload_required, search, workload_complementary_activity, extension_curricular_workload, workload_duration, nomeCurso);
            else await curriculumRepository.atualizarRegistro(id_course, id_curriculum, name, max_duration_enrollment, max_workload_enrollment, min_duration_enrollment, min_workload_elective, min_workload_enrollment, min_workload_optional, min_workload_required, search, workload_complementary_activity, extension_curricular_workload, workload_duration, nomeCurso);

            await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            await beginTransaction.rollback();
        }
    }

    async BuscaTodos(){
        let curriculumRepository = new CurriculumRepository();
        try {
            const Filiations = await curriculumRepository.BuscarTodas();
            return Filiations;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloId(id_curriculum){
        let curriculumRepository = new CurriculumRepository();
        try {
            const dados = await curriculumRepository.BuscarPeloId(id_curriculum);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = CurriculoService;