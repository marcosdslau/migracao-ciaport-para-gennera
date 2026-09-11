
const EnrollmentRepository = require('../repository/EnrollmentRepository');
const connection = require('../../database/database')

class EnrollmentService {

    constructor(){

    }

    async Registra(id_student, id_enrollment, code, academic_responsible_person_cpf, financial_responsible_person_document, academic_calendar, course, curriculum, module, clazz, shift, status, id_campaign, campaign, polo, date_enrollment, start_date, cancellation_reason, cancellation_date, observation, id_parent_enrollment){
        let beginTransaction = await connection.transaction();
        let subjectRepository = new EnrollmentRepository(beginTransaction);
        try {
            let alreadExist = await subjectRepository.BuscarPeloId(id_enrollment);
            if(!alreadExist) await subjectRepository.criarRegistro(id_student, id_enrollment, code, academic_responsible_person_cpf, financial_responsible_person_document, academic_calendar, course, curriculum, module, clazz, shift, status, id_campaign, campaign, polo, date_enrollment, start_date, cancellation_reason, cancellation_date, observation, id_parent_enrollment);
            else await subjectRepository.atualizarRegistro(id_student, id_enrollment, code, academic_responsible_person_cpf, financial_responsible_person_document, academic_calendar, course, curriculum, module, clazz, shift, status, id_campaign, campaign, polo, date_enrollment, start_date, cancellation_reason, cancellation_date, observation, id_parent_enrollment);

            await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            await beginTransaction.rollback();
        }
    }

    async BuscaTodos(){
        let subjectRepository = new EnrollmentRepository();
        try {
            const dados = await subjectRepository.BuscarTodas();
            return dados;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloId(id_enrollment){
        let subjectRepository = new EnrollmentRepository();
        try {
            const dados = await subjectRepository.BuscarPeloId(id_enrollment);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = EnrollmentService;