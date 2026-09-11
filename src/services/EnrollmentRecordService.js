
const EnrollmentRecordRepository = require('../repository/EnrollmentRecordRepository');
const connection = require('../../database/database')

class EnrollmentRecordService {

    constructor(){

    }

    async Registra(id_student, id_person, id_enrollment_record, id_enrollment_record_aux, id_enrollment, institution_name, index, institution_city, institution_state, course, module, academic_calendar, clazz, status, working_days, complementary_status, attendance, workload, shift, law, instructional_days, obs, finish_date, curriculum_name, id_course_level, id_course_type, mec_course_code, academic_grade, coordinator, coordinator_grade, recognition, secretary, secretary_subscription, modality, authorization, course_name_equivalence, curriculum_name_equivalence, start_date, certification_dispatch_date, graduation_date, admission, writing_score, average_educational_history, score_educational_history, ranking_educational_history, number_of_vacancies, admission_execution_date, reserveof_vacancies, entrant_status, exam_date, conclusion_date, certification_delivery_date, certification_dispatch_number_identification, certification_dispatch_institution_name, certification_dispatch_institution_emecCode, record_date, record_number_identification, record_book, certification_register_institution_name, certification_register_institution_emecCode, dou_info_publishing_date, final_project_name, final_project_grade, final_project_presentation_date, final_project_assessment, social_support, student_parfor, academic_mobility, financial_student, activity_extracurricular, monograph_advisor){
        let beginTransaction = await connection.transaction();
        let repository = new EnrollmentRecordRepository(beginTransaction);
        try {
            let alreadExist = await repository.BuscarPeloId(id_enrollment_record_aux,);
            if(!alreadExist) await repository.criarRegistro(id_student, id_person, id_enrollment_record, id_enrollment_record_aux, id_enrollment, institution_name, index, institution_city, institution_state, course, module, academic_calendar, clazz, status, working_days, complementary_status, attendance, workload, shift, law, instructional_days, obs, finish_date, curriculum_name, id_course_level, id_course_type, mec_course_code, academic_grade, coordinator, coordinator_grade, recognition, secretary, secretary_subscription, modality, authorization, course_name_equivalence, curriculum_name_equivalence, start_date, certification_dispatch_date, graduation_date, admission, writing_score, average_educational_history, score_educational_history, ranking_educational_history, number_of_vacancies, admission_execution_date, reserveof_vacancies, entrant_status, exam_date, conclusion_date, certification_delivery_date, certification_dispatch_number_identification, certification_dispatch_institution_name, certification_dispatch_institution_emecCode, record_date, record_number_identification, record_book, certification_register_institution_name, certification_register_institution_emecCode, dou_info_publishing_date, final_project_name, final_project_grade, final_project_presentation_date, final_project_assessment, social_support, student_parfor, academic_mobility, financial_student, activity_extracurricular, monograph_advisor);
            else await repository.atualizarRegistro(id_student, id_person, id_enrollment_record_aux, id_enrollment, institution_name, index, institution_city, institution_state, course, module, academic_calendar, clazz, status, working_days, complementary_status, attendance, workload, shift, law, instructional_days, obs, finish_date, curriculum_name, id_course_level, id_course_type, mec_course_code, academic_grade, coordinator, coordinator_grade, recognition, secretary, secretary_subscription, modality, authorization, course_name_equivalence, curriculum_name_equivalence, start_date, certification_dispatch_date, graduation_date, admission, writing_score, average_educational_history, score_educational_history, ranking_educational_history, number_of_vacancies, admission_execution_date, reserveof_vacancies, entrant_status, exam_date, conclusion_date, certification_delivery_date, certification_dispatch_number_identification, certification_dispatch_institution_name, certification_dispatch_institution_emecCode, record_date, record_number_identification, record_book, certification_register_institution_name, certification_register_institution_emecCode, dou_info_publishing_date, final_project_name, final_project_grade, final_project_presentation_date, final_project_assessment, social_support, student_parfor, academic_mobility, financial_student, activity_extracurricular, monograph_advisor);

            await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            await beginTransaction.rollback();
        }
    }

    async BuscaTodos(){
        let repository = new EnrollmentRecordRepository();
        try {
            const dados = await repository.BuscarTodas();
            return dados;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloId(id_enrollment_record_aux){
        let repository = new EnrollmentRecordRepository();
        try {
            const dados = await repository.BuscarPeloId(id_enrollment_record_aux,);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloIdStudent(id_student){
        let repository = new EnrollmentRecordRepository();
        try {
            const dados = await repository.BuscarPeloIdStudent(id_student,);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }
    

    async BuscarPeloIdAux_retornoIdEnrollmentRecord(id_enrollment_record_aux){
        let repository = new EnrollmentRecordRepository();
        try {
            const dados = await repository.BuscarPeloIdAux(id_enrollment_record_aux);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }

    async UpdateIsImported(id_enrollment_record, isImported = true){
        let repository = new EnrollmentRecordRepository();
        try {
            await repository.UpdateIsImported(id_enrollment_record, isImported);
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
}

module.exports = EnrollmentRecordService;