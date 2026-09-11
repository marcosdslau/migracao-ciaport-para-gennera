
const EnrollmentRecordSubjectProfessorRepository = require('../repository/EnrollmentRecordSubjectProfessorRepository');
const connection = require('../../database/database')

class EnrollmentRecordSubjectProfessorService {

    constructor(){

    }

    async Registra(id_enrollment_subject_record_professor, id_enrollment_subject_record_professor_aux, id_enrollment_subject_record, professor_name, academic_title){
        let beginTransaction = await connection.transaction();
        let repository = new EnrollmentRecordSubjectProfessorRepository(beginTransaction);
        try {
            let alreadExist = await repository.BuscarPeloId(id_enrollment_subject_record_professor_aux);
            if(!alreadExist) await repository.criarRegistro(id_enrollment_subject_record_professor, id_enrollment_subject_record_professor_aux, id_enrollment_subject_record, professor_name, academic_title);
            else await repository.atualizarRegistro(id_enrollment_subject_record_professor, id_enrollment_subject_record_professor_aux, id_enrollment_subject_record, professor_name, academic_title);

            await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            await beginTransaction.rollback();
        }
    }

    async BuscaTodos(){
        let repository = new EnrollmentRecordSubjectProfessorRepository();
        try {
            const dados = await repository.BuscarTodas();
            return dados;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloId(id_enrollment_subject_record_aux){
        let repository = new EnrollmentRecordSubjectProfessorRepository();
        try {
            const dados = await repository.BuscarPeloId(id_enrollment_subject_record_aux);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloIdRPA(id_enrollment_subject_record){
        let repository = new EnrollmentRecordSubjectProfessorRepository();
        try {
            const dados = await repository.BuscarPeloIdRPA(id_enrollment_subject_record);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }
    
}

module.exports = EnrollmentRecordSubjectProfessorService;