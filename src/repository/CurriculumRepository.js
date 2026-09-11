const model = require('../models/CurriculumModel');
class CurriculumRepository {
    _transaction;
    constructor(transaction = null){
        this._transaction = transaction;
    }


    async BuscarPeloId(id_curriculum) {
        return await model.findOne({
            where:{id_curriculum: `${id_curriculum}`}
        });
    }

    async BuscarTodas() {
        return await model.findAll();
    }

    
    /// setters
    criarRegistro(id_course, id_curriculum, name, max_duration_enrollment, max_workload_enrollment, min_duration_enrollment, min_workload_elective, min_workload_enrollment, min_workload_optional, min_workload_required, search, workload_complementary_activity, extension_curricular_workload, workload_duration, nomeCurso) {
        return model.create({ 
            id_course, id_curriculum, name, max_duration_enrollment, max_workload_enrollment, min_duration_enrollment, min_workload_elective, min_workload_enrollment, min_workload_optional, min_workload_required, search, workload_complementary_activity, extension_curricular_workload, workload_duration, nomeCurso
        },{
            transaction: this._transaction
        });
    }
    atualizarRegistro(id_course, id_curriculum, name, max_duration_enrollment, max_workload_enrollment, min_duration_enrollment, min_workload_elective, min_workload_enrollment, min_workload_optional, min_workload_required, search, workload_complementary_activity, extension_curricular_workload, workload_duration, nomeCurso) {
        return model.update({ 
            id_course, id_curriculum, name, max_duration_enrollment, max_workload_enrollment, min_duration_enrollment, min_workload_elective, min_workload_enrollment, min_workload_optional, min_workload_required, search, workload_complementary_activity, extension_curricular_workload, workload_duration, nomeCurso
        },{
            where:{
                id_curriculum
            },
            transaction: this._transaction
        });
    }

}
module.exports = CurriculumRepository;