const model = require('../models/CurriculumOfferClassModel');
class CurriculumOfferClassesRepository {
    _transaction;
    constructor(transaction = null){
        this._transaction = transaction;
    }


    async BuscarPeloId(id_class) {
        return await model.findOne({
            where:{id_class: `${id_class}`}
        });
    }

    async BuscarTodas() {
        return await model.findAll();
    }

    
    /// setters
    criarRegistro(id_class, id_curriculum_offer, id_module, name, start_date, end_date, shift, inep_code, physical_location) {
        return model.create({ 
            id_class, id_curriculum_offer, id_module, name, start_date, end_date, shift, inep_code, physical_location
        },{
            transaction: this._transaction
        });
    }
    atualizarRegistro(id_class, id_curriculum_offer, id_module, name, start_date, end_date, shift, inep_code, physical_location) {
        return model.update({ 
            id_class, id_curriculum_offer, id_module, name, start_date, end_date, shift, inep_code, physical_location
        },{
            where:{
                id_class
            },
            transaction: this._transaction
        });
    }

}
module.exports = CurriculumOfferClassesRepository;