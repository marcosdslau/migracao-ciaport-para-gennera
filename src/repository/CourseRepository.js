const model = require('../models/CourseModel');
class CourseRepository {
    _transaction;
    constructor(transaction = null){
        this._transaction = transaction;
    }


    async BuscarCursoPeloIdCourse(id_course) {
        return await model.findOne({
            where:{id_course: `${id_course}`}
        });
    }

    async BuscarTodasCursos() {
        return await model.findAll();
    }

    
    /// setters
    criarCurso(id_course, name, code, level, type, coordinator, grade, secretary, secretary_subscription, authorization, recognition, code_inep, modality) {
        return model.create({ 
            id_course, name, code, level, type, coordinator, grade, secretary, secretary_subscription, authorization, recognition, code_inep, modality
        },{
            transaction: this._transaction
        });
    }
    atualizarCurso(id_course, name, code, level, type, coordinator, grade, secretary, secretary_subscription, authorization, recognition, code_inep, modality) {
        return model.update({ 
            id_course, name, code, level, type, coordinator, grade, secretary, secretary_subscription, authorization, recognition, code_inep, modality
        },{
            where:{
                id_course
            },
            transaction: this._transaction
        });
    }

}
module.exports = CourseRepository;