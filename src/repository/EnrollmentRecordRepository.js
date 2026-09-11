const model = require('../models/EnrollmentRecordModel');
class EnrollmentRecordRepository {
    _transaction;
    constructor(transaction = null){
        this._transaction = transaction;
    }


    async BuscarPeloId(id_enrollment_record_aux) {
        return await model.findOne({
            where:{id_enrollment_record_aux: `${id_enrollment_record_aux}`}
        });
    }

    async BuscarPeloIdStudent(id_student) {
        return await model.findAll({
            where:{id_student: `${id_student}`}
        });
    }

    

    async BuscarPeloIdAux(id_enrollment_record_aux) {
        return await model.findOne({
            attributes: ['id_enrollment_record', 'isImported'],
            where:{id_enrollment_record_aux: `${id_enrollment_record_aux}`}
        });
    }

    async BuscarTodas() {
        return await model.findAll();
    }

    
    /// setters
    criarRegistro(id_student, id_person, id_enrollment_record, id_enrollment_record_aux, id_enrollment, institution_name, index, institution_city, institution_state, course, module, academic_calendar, clazz, status, working_days, complementary_status, attendance, workload, shift, law, instructional_days, obs, finish_date, curriculum_name, id_course_level, id_course_type, mec_course_code, academic_grade, coordinator, coordinator_grade, recognition, secretary, secretary_subscription, modality, authorization, course_name_equivalence, curriculum_name_equivalence, start_date, certification_dispatch_date, graduation_date, admission, writing_score, average_educational_history, score_educational_history, ranking_educational_history, number_of_vacancies, admission_execution_date, reserveof_vacancies, entrant_status, exam_date, conclusion_date, certification_delivery_date, certification_dispatch_number_identification, certification_dispatch_institution_name, certification_dispatch_institution_emecCode, record_date, record_number_identification, record_book, certification_register_institution_name, certification_register_institution_emecCode, dou_info_publishing_date, final_project_name, final_project_grade, final_project_presentation_date, final_project_assessment, social_support, student_parfor, academic_mobility, financial_student, activity_extracurricular, monograph_advisor) {
        return model.create({ 
            id_student, id_person, id_enrollment_record, id_enrollment_record_aux, id_enrollment, institution_name, index, institution_city, institution_state, course, module, academic_calendar, class: clazz, status, working_days, complementary_status, attendance, workload, shift, law, instructional_days, obs, finish_date, curriculum_name, id_course_level, id_course_type, mec_course_code, academic_grade, coordinator, coordinator_grade, recognition, secretary, secretary_subscription, modality, authorization, course_name_equivalence, curriculum_name_equivalence, start_date, certification_dispatch_date, graduation_date, admission, writing_score, average_educational_history, score_educational_history, ranking_educational_history, number_of_vacancies, admission_execution_date, reserveof_vacancies, entrant_status, exam_date, conclusion_date, certification_delivery_date, certification_dispatch_number_identification, certification_dispatch_institution_name, certification_dispatch_institution_emecCode, record_date, record_number_identification, record_book, certification_register_institution_name, certification_register_institution_emecCode, dou_info_publishing_date, final_project_name, final_project_grade, final_project_presentation_date, final_project_assessment, social_support, student_parfor, academic_mobility, financial_student, activity_extracurricular, monograph_advisor
        },{
            transaction: this._transaction
        });
    }
    atualizarRegistro(id_student, id_person, id_enrollment_record_aux, id_enrollment, institution_name, index, institution_city, institution_state, course, module, academic_calendar, clazz, status, working_days, complementary_status, attendance, workload, shift, law, instructional_days, obs, finish_date, curriculum_name, id_course_level, id_course_type, mec_course_code, academic_grade, coordinator, coordinator_grade, recognition, secretary, secretary_subscription, modality, authorization, course_name_equivalence, curriculum_name_equivalence, start_date, certification_dispatch_date, graduation_date, admission, writing_score, average_educational_history, score_educational_history, ranking_educational_history, number_of_vacancies, admission_execution_date, reserveof_vacancies, entrant_status, exam_date, conclusion_date, certification_delivery_date, certification_dispatch_number_identification, certification_dispatch_institution_name, certification_dispatch_institution_emecCode, record_date, record_number_identification, record_book, certification_register_institution_name, certification_register_institution_emecCode, dou_info_publishing_date, final_project_name, final_project_grade, final_project_presentation_date, final_project_assessment, social_support, student_parfor, academic_mobility, financial_student, activity_extracurricular, monograph_advisor) {
        return model.update({ 
            id_student, id_person, id_enrollment_record_aux, id_enrollment, institution_name, index, institution_city, institution_state, course, module, academic_calendar, class: clazz, status, working_days, complementary_status, attendance, workload, shift, law, instructional_days, obs, finish_date, curriculum_name, id_course_level, id_course_type, mec_course_code, academic_grade, coordinator, coordinator_grade, recognition, secretary, secretary_subscription, modality, authorization, course_name_equivalence, curriculum_name_equivalence, start_date, certification_dispatch_date, graduation_date, admission, writing_score, average_educational_history, score_educational_history, ranking_educational_history, number_of_vacancies, admission_execution_date, reserveof_vacancies, entrant_status, exam_date, conclusion_date, certification_delivery_date, certification_dispatch_number_identification, certification_dispatch_institution_name, certification_dispatch_institution_emecCode, record_date, record_number_identification, record_book, certification_register_institution_name, certification_register_institution_emecCode, dou_info_publishing_date, final_project_name, final_project_grade, final_project_presentation_date, final_project_assessment, social_support, student_parfor, academic_mobility, financial_student, activity_extracurricular, monograph_advisor
        },{
            where:{
                id_enrollment_record_aux
            },
            transaction: this._transaction
        });
    }

    async UpdateIsImported(id_enrollment_record, isImported = true) {
        return await model.update({ 
            isImported
        },{
            where:{
                id_enrollment_record
            },
            transaction: this._transaction
        });
    }

}
module.exports = EnrollmentRecordRepository;