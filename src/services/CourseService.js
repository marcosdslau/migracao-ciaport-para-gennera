
const CourseRepository = require('../repository/CourseRepository');
const connection = require('../../database/database')

class CourseService {

    constructor(){

    }

    async RegistraCurso(id_course, name, code, level, type, coordinator, grade, secretary, secretary_subscription, authorization, recognition, code_inep, modality){
        let beginTransaction = await connection.transaction();
        let courseRepository = new CourseRepository(beginTransaction);
        try {
            let alreadExist = await courseRepository.BuscarCursoPeloIdCourse(id_course);
            if(!alreadExist) await courseRepository.criarCurso(id_course, name, code, level, type, coordinator, grade, secretary, secretary_subscription, authorization, recognition, code_inep, modality);
            else await courseRepository.atualizarCurso(id_course, name, code, level, type, coordinator, grade, secretary, secretary_subscription, authorization, recognition, code_inep, modality);

            await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            await beginTransaction.rollback();
        }
    }

    async BuscaTodosCursos(){
        let courseRepository = new CourseRepository();
        try {
            const Filiations = await courseRepository.BuscarTodasCursos();
            return Filiations;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarCursosPeloIdCourse(id_course){
        let courseRepository = new CourseRepository();
        try {
            const pessoa = await courseRepository.BuscarCursoPeloIdCourse(id_course);
            return pessoa;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = CourseService;