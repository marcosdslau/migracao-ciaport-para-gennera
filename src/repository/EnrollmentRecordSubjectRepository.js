const model = require('../models/EnrollmentRecordSubjectModel');
const { Op } = require("sequelize");
class EnrollmentRecordSubjectRepository {
    _transaction;
    constructor(transaction = null){
        this._transaction = transaction;
    }


    async BuscarPeloId(id_enrollment_subject_record_aux) {
        return await model.findOne({
            where:{id_enrollment_subject_record_aux: `${id_enrollment_subject_record_aux}`}
        });
    }
    async BuscarPeloIdEnrollmentRecord(id_enrollment_record) {
        return await model.findAll({
            where:{id_enrollment_record: `${id_enrollment_record}`}
        });
    }

    async BuscarPeloIdsEnrollmentRecord(arr) {
        return await model.findAll({
            where:{
                id_enrollment_record: {
                    [Op.in]: arr
                }
            }
        });
    }

    async BuscarTodas() {
        return await model.findAll();
    }

    async BuscarTodasDispensas() {
        return await model.findAll({
            where:{
                segunda_carga: true
            }
        });
    }

    
    /// setters
    criarRegistro(id_enrollment_subject_record, id_enrollment_subject_record_aux, id_enrollment_record, subject, academic_calendar, subject_group, subject_type, subject_area, average_grade, attendance, workload, total_absences, hours_absence, waiver, achievement_test_grade, status, complementary_status, letter_grade, cancellation_reason, obs, dismissed, dismissal_reason, failure_reason, course_name_equivalence, curriculum_name_equivalence, module_name_equivalence, subject_name_equivalence, internship, internship_start_date, internship_end_date, segunda_carga = false) {
        return model.create({ 
            id_enrollment_subject_record, id_enrollment_subject_record_aux, id_enrollment_record, subject, academic_calendar, subject_group, subject_type, subject_area, average_grade, attendance, workload, total_absences, hours_absence, waiver, achievement_test_grade, status, complementary_status, letter_grade, cancellation_reason, obs, dismissed, dismissal_reason, failure_reason, course_name_equivalence, curriculum_name_equivalence, module_name_equivalence, subject_name_equivalence, internship, internship_start_date, internship_end_date, segunda_carga
        },{
            transaction: this._transaction
        });
    }
    atualizarRegistro(id_enrollment_subject_record, id_enrollment_subject_record_aux, id_enrollment_record, subject, academic_calendar, subject_group, subject_type, subject_area, average_grade, attendance, workload, total_absences, hours_absence, waiver, achievement_test_grade, status, complementary_status, letter_grade, cancellation_reason, obs, dismissed, dismissal_reason, failure_reason, course_name_equivalence, curriculum_name_equivalence, module_name_equivalence, subject_name_equivalence, internship, internship_start_date, internship_end_date, segunda_carga = false) {
        return model.update({ 
            id_enrollment_record, subject, academic_calendar, subject_group, subject_type, subject_area, average_grade, attendance, workload, total_absences, hours_absence, waiver, achievement_test_grade, status, complementary_status, letter_grade, cancellation_reason, obs, dismissed, dismissal_reason, failure_reason, course_name_equivalence, curriculum_name_equivalence, module_name_equivalence, subject_name_equivalence, internship, internship_start_date, internship_end_date, segunda_carga
        },{
            where:{
                id_enrollment_subject_record_aux
            },
            transaction: this._transaction
        });
    }

}
module.exports = EnrollmentRecordSubjectRepository;