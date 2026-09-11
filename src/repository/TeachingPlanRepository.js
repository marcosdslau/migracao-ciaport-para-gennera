const model = require('../models/TeachingPlanModel');
class TeachingPlanRepository {
    _transaction;
    constructor(transaction = null){
        this._transaction = transaction;
    }


    async BuscarPeloId(id_subject) {
        return await model.findOne({
            where:{id_subject: `${id_subject}`}
        });
    }

    async BuscarTodas() {
        return await model.findAll();
    }

    
    /// setters
    criarRegistro(id_subject, id_syllabus, syllabus, goals, program_content, methodology_approach, evaluation_process, bibliographic_reference, complementary_biblographic, skills_and_competences) {
        return model.create({ 
            id_subject, id_syllabus, syllabus, goals, program_content, methodology_approach, evaluation_process, bibliographic_reference, complementary_biblographic, skills_and_competences
        },{
            transaction: this._transaction
        });
    }
    atualizarRegistro(id_subject, id_syllabus, syllabus, goals, program_content, methodology_approach, evaluation_process, bibliographic_reference, complementary_biblographic, skills_and_competences) {
        return model.update({ 
            id_syllabus, syllabus, goals, program_content, methodology_approach, evaluation_process, bibliographic_reference, complementary_biblographic, skills_and_competences
        },{
            where:{
                id_subject
            },
            transaction: this._transaction
        });
    }

}
module.exports = TeachingPlanRepository;

