const model = require('../models/EnrollmentPosModel');
class EnrollmentRepository {
    _transaction;
    constructor(transaction = null){
        this._transaction = transaction;
    }


    async BuscarPeloId(id_enrollment) {
        return await model.findOne({
            where:{id_enrollment: `${id_enrollment}`}
        });
    }

    async BuscarTodas() {
        return await model.findAll();
    }

    
    /// setters
    criarRegistro(id_student, id_enrollment, name, code, academic_responsible_person_cpf, financial_responsible_person_document, academic_calendar, course, curriculum, module, clazz, shift, status, id_campaign, campaign, polo, date_enrollment, start_date, cancellation_reason, cancellation_date, observation, id_parent_enrollment) {
        return model.create({ 
            id_student, id_enrollment, name, code, academic_responsible_person_cpf, financial_responsible_person_document, academic_calendar, course, curriculum, module, class: clazz, shift, status, id_campaign, campaign, polo, date_enrollment, start_date, cancellation_reason, cancellation_date, observation, id_parent_enrollment
        },{
            transaction: this._transaction
        });
    }
    atualizarRegistro(id_student, id_enrollment, name, code, academic_responsible_person_cpf, financial_responsible_person_document, academic_calendar, course, curriculum, module, clazz, shift, status, id_campaign, campaign, polo, date_enrollment, start_date, cancellation_reason, cancellation_date, observation, id_parent_enrollment) {
        return model.update({ 
            id_student, id_enrollment, name, code, academic_responsible_person_cpf, financial_responsible_person_document, academic_calendar, course, curriculum, module, class: clazz, shift, status, id_campaign, campaign, polo, date_enrollment, start_date, cancellation_reason, cancellation_date, observation, id_parent_enrollment
        },{
            where:{
                id_enrollment
            },
            transaction: this._transaction
        });
    }
    EnrollmentRepository
}
module.exports = EnrollmentRepository;