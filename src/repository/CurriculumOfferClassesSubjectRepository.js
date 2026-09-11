const model = require('../models/CurriculumOfferClassSubjectModel');
class CurriculumOfferClassesSubjectRepository {
    _transaction;
    constructor(transaction = null){
        this._transaction = transaction;
    }


    async BuscarPeloId(id_subject_offer) {
        return await model.findOne({
            where:{id_subject_offer: `${id_subject_offer}`}
        });
    }

    async BuscarTodas() {
        return await model.findAll();
    }

    
    /// setters
    criarRegistro(id_subject_offer, id_class, id_subject, start_date, complement_name, disregard_grade) {
        return model.create({ 
            id_subject_offer, id_class, id_subject, start_date, complement_name, disregard_grade
        },{
            transaction: this._transaction
        });
    }
    atualizarRegistro(id_subject_offer, id_class, id_subject, start_date, complement_name, disregard_grade) {
        return model.update({ 
            id_subject_offer, id_class, id_subject, start_date, complement_name, disregard_grade
        },{
            where:{
                id_subject_offer
            },
            transaction: this._transaction
        });
    }

}
module.exports = CurriculumOfferClassesSubjectRepository;