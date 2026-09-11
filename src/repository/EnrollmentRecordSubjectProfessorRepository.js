const model = require('../models/EnrollmentRecordSubjectProfessorModel');
class EnrollmentRecordSubjectProfessorRepository {
    _transaction;
    constructor(transaction = null){
        this._transaction = transaction;
    }


    async BuscarPeloId(id_enrollment_subject_record_professor_aux) {
        return await model.findOne({
            where:{id_enrollment_subject_record_professor_aux: `${id_enrollment_subject_record_professor_aux}`}
        });
    }
    async BuscarPeloIdRPA(id_enrollment_subject_record) {
        return await model.findOne({
            where:{id_enrollment_subject_record: `${id_enrollment_subject_record}`}
        });
    }
    

    async BuscarTodas() {
        return await model.findAll();
    }

    
    /// setters
    criarRegistro(id_enrollment_subject_record_professor, id_enrollment_subject_record_professor_aux, id_enrollment_subject_record, professor_name, academic_title) {
        return model.create({ 
            id_enrollment_subject_record_professor, id_enrollment_subject_record_professor_aux, id_enrollment_subject_record, professor_name, academic_title, 
        },{
            transaction: this._transaction
        });
    }
    atualizarRegistro(id_enrollment_subject_record_professor, id_enrollment_subject_record_professor_aux, id_enrollment_subject_record, professor_name, academic_title) {
        return model.update({ 
            id_enrollment_subject_record, professor_name, academic_title
        },{
            where:{
                id_enrollment_subject_record_professor_aux
            },
            transaction: this._transaction
        });
    }

}
module.exports = EnrollmentRecordSubjectProfessorRepository;