
const EnrollmentSubjectRepository = require('../repository/EnrollmentSubjectRepository');
const connection = require('../../database/database')

class EnrollmentSubjectService {

    constructor(){

    }

    async Registra(id_enrollment, course, curriculum, module, subject, clazz, shift, type, status, cancellation_reason, credit, amount, polo, internship_start_date, internship_end_date){
        let beginTransaction = await connection.transaction();
        let subjectRepository = new EnrollmentSubjectRepository(beginTransaction);
        try {
            let alreadExist = await subjectRepository.BuscarPeloId(id_enrollment, course, curriculum, module, clazz, subject);
            if(!alreadExist) await subjectRepository.criarRegistro(id_enrollment, course, curriculum, module, subject, clazz, shift, type, status, cancellation_reason, credit, amount, polo, internship_start_date, internship_end_date);
            else await subjectRepository.atualizarRegistro(id_enrollment, course, curriculum, module, subject, clazz, shift, type, status, cancellation_reason, credit, amount, polo, internship_start_date, internship_end_date);

            await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            await beginTransaction.rollback();
        }
    }

    async BuscaTodos(){
        let subjectRepository = new EnrollmentSubjectRepository();
        try {
            const dados = await subjectRepository.BuscarTodas();
            return dados;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloId(id_enrollment){
        let subjectRepository = new EnrollmentSubjectRepository();
        try {
            const dados = await subjectRepository.BuscarPeloId(id_enrollment);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = EnrollmentSubjectService;