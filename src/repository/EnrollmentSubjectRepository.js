const model = require('../models/EnrollmentSubjectModel');
class EnrollmentSubjectRepository {
    _transaction;
    constructor(transaction = null){
        this._transaction = transaction;
    }


    async BuscarPeloId(id_enrollment, course, curriculum, module, clazz, subject) {
        return await model.findOne({
            where:{
                id_enrollment: `${id_enrollment}`,
                course: `${course}`,
                curriculum: `${curriculum}`,
                module: `${module}`,
                class: `${clazz}`,
                subject: `${subject}`                
            }
        });
    }

    async BuscarTodas() {
        return await model.findAll();
    }

    
    /// setters
    criarRegistro(id_enrollment, course, curriculum, module, subject, clazz, shift, type, status, cancellation_reason, credit, amount, polo, internship_start_date, internship_end_date) {
        return model.create({ 
            id_enrollment, course, curriculum, module, subject, class: clazz, shift, type, status, cancellation_reason, credit, amount, polo, internship_start_date, internship_end_date
        },{
            transaction: this._transaction
        });
    }
    atualizarRegistro(id_enrollment, course, curriculum, module, subject, clazz, shift, type, status, cancellation_reason, credit, amount, polo, internship_start_date, internship_end_date) {
        return model.update({ 
            id_enrollment, course, curriculum, module, subject, class: clazz, shift, type, status, cancellation_reason, credit, amount, polo, internship_start_date, internship_end_date
        },{
            where:{
                id_enrollment,
                course,
                curriculum,
                module,
                class: clazz,
                subject
            },
            transaction: this._transaction
        });
    }
}
module.exports = EnrollmentSubjectRepository;


