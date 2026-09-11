const model = require('../models/EnrollmentRecordExtensionActivityModel');
class EnrollmentRecordExtensionActivityRepository {
    _transaction;
    constructor(transaction = null){
        this._transaction = transaction;
    }


    async BuscarPeloId(id_enrollment_complementary_activity_record_aux) {
        return await model.findOne({
            where:{id_enrollment_complementary_activity_record_aux: `${id_enrollment_complementary_activity_record_aux}`}
        });
    }

    async BuscarTodas() {
        return await model.findAll();
    }

    
    /// setters
    criarRegistro(id_enrollment_complementary_activity_record, id_enrollment_complementary_activity_record_aux, id_enrollment_record,  category, name, description, start_date, end_date, workload) {
        return model.create({ 
            id_enrollment_complementary_activity_record, id_enrollment_complementary_activity_record_aux, id_enrollment_record,  category, name, description, start_date, end_date, workload, 
        },{
            transaction: this._transaction
        });
    }
    atualizarRegistro(id_enrollment_complementary_activity_record, id_enrollment_complementary_activity_record_aux, id_enrollment_record,  category, name, description, start_date, end_date, workload) {
        return model.update({ 
            id_enrollment_record,  category, name, description, start_date, end_date, workload
        },{
            where:{
                id_enrollment_complementary_activity_record_aux
            },
            transaction: this._transaction
        });
    }

}
module.exports = EnrollmentRecordExtensionActivityRepository;


  