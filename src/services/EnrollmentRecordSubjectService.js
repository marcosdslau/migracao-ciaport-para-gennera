
const EnrollmentRecordSubjectRepository = require('../repository/EnrollmentRecordSubjectRepository');
const connection = require('../../database/database')

class EnrollmentRecordSubjectService {

    constructor(){

    }

    async Registra(id_enrollment_subject_record, id_enrollment_subject_record_aux, id_enrollment_record, subject, academic_calendar, subject_group, subject_type, subject_area, average_grade, attendance, workload, total_absences, hours_absence, waiver, achievement_test_grade, status, complementary_status, letter_grade, cancellation_reason, obs, dismissed, dismissal_reason, failure_reason, course_name_equivalence, curriculum_name_equivalence, module_name_equivalence, subject_name_equivalence, internship, internship_start_date, internship_end_date, segunda_carga = false){
        let beginTransaction = await connection.transaction();
        let repository = new EnrollmentRecordSubjectRepository(beginTransaction);
        try {
            let alreadExist = await repository.BuscarPeloId(id_enrollment_subject_record_aux);
            if(!alreadExist) await repository.criarRegistro(id_enrollment_subject_record, id_enrollment_subject_record_aux, id_enrollment_record, subject, academic_calendar, subject_group, subject_type, subject_area, average_grade, attendance, workload, total_absences, hours_absence, waiver, achievement_test_grade, status, complementary_status, letter_grade, cancellation_reason, obs, dismissed, dismissal_reason, failure_reason, course_name_equivalence, curriculum_name_equivalence, module_name_equivalence, subject_name_equivalence, internship, internship_start_date, internship_end_date, segunda_carga);
            else await repository.atualizarRegistro(id_enrollment_subject_record, id_enrollment_subject_record_aux, id_enrollment_record, subject, academic_calendar, subject_group, subject_type, subject_area, average_grade, attendance, workload, total_absences, hours_absence, waiver, achievement_test_grade, status, complementary_status, letter_grade, cancellation_reason, obs, dismissed, dismissal_reason, failure_reason, course_name_equivalence, curriculum_name_equivalence, module_name_equivalence, subject_name_equivalence, internship, internship_start_date, internship_end_date, segunda_carga);

            await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            await beginTransaction.rollback();
        }
    }

    async BuscaTodos(){
        let repository = new EnrollmentRecordSubjectRepository();
        try {
            const dados = await repository.BuscarTodas();
            return dados;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscaTodasDispensas(){
        let repository = new EnrollmentRecordSubjectRepository();
        try {
            const dados = await repository.BuscarTodasDispensas();
            return dados;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloId(id_enrollment_subject_record_aux){
        let repository = new EnrollmentRecordSubjectRepository();
        try {
            const dados = await repository.BuscarPeloId(id_enrollment_subject_record_aux);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }
    async BuscarPeloIdEnrollmentRecord(id_enrollment_record){
        let repository = new EnrollmentRecordSubjectRepository();
        try {
            const dados = await repository.BuscarPeloIdEnrollmentRecord(id_enrollment_record);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }
    async BuscarPeloIdsEnrollmentRecord(arr){
        let repository = new EnrollmentRecordSubjectRepository();
        try {
            const dados = await repository.BuscarPeloIdsEnrollmentRecord(arr);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }

    
}

module.exports = EnrollmentRecordSubjectService;