const model = require('../models/CurriculumOfferModel');
class CurriculumOfferRepository {
    _transaction;
    constructor(transaction = null){
        this._transaction = transaction;
    }


    async BuscarPeloId(id_curriculum_offer) {
        return await model.findOne({
            where:{id_curriculum_offer: `${id_curriculum_offer}`}
        });
    }

    async BuscarTodas() {
        return await model.findAll();
    }

    
    /// setters
    criarRegistro(id_curriculum_offer, id_academic_calendar, id_curriculum) {
        return model.create({ 
            id_curriculum_offer, id_academic_calendar, id_curriculum
        },{
            transaction: this._transaction
        });
    }
    atualizarRegistro(id_curriculum_offer, id_academic_calendar, id_curriculum) {
        return model.update({ 
            id_curriculum_offer, id_academic_calendar, id_curriculum
        },{
            where:{
                id_curriculum_offer
            },
            transaction: this._transaction
        });
    }

}
module.exports = CurriculumOfferRepository;