
const EnrollmentRecordExtensionActivityRepository = require('../repository/EnrollmentRecordExtensionActivityRepository');
const connection = require('../../database/database')

class EnrollmentRecordExtensionActivityService {

    constructor(){

    }

    async Registra(id_enrollment_complementary_activity_record, id_enrollment_complementary_activity_record_aux, id_enrollment_record,  category, name, description, start_date, end_date, workload){
        let beginTransaction = await connection.transaction();
        let repository = new EnrollmentRecordExtensionActivityRepository(beginTransaction);
        try {
            let alreadExist = await repository.BuscarPeloId(id_enrollment_complementary_activity_record_aux);
            if(!alreadExist) await repository.criarRegistro(id_enrollment_complementary_activity_record, id_enrollment_complementary_activity_record_aux, id_enrollment_record,  category, name, description, start_date, end_date, workload);
            else await repository.atualizarRegistro(id_enrollment_complementary_activity_record, id_enrollment_complementary_activity_record_aux, id_enrollment_record,  category, name, description, start_date, end_date, workload);

            await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            await beginTransaction.rollback();
        }
    }

    async BuscaTodos(){
        let repository = new EnrollmentRecordExtensionActivityRepository();
        try {
            const dados = await repository.BuscarTodas();
            return dados;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloId(id_enrollment_complementary_activity_record_aux){
        let repository = new EnrollmentRecordExtensionActivityRepository();
        try {
            const dados = await repository.BuscarPeloId(id_enrollment_complementary_activity_record_aux);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = EnrollmentRecordExtensionActivityService;