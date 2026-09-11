const model = require('../models/ModuleModel');
class ModulesRepository {
    _transaction;
    constructor(transaction = null){
        this._transaction = transaction;
    }


    async BuscarPeloId(id_module) {
        return await model.findOne({
            where:{id_module: `${id_module}`}
        });
    }

    async BuscarTodas() {
        return await model.findAll();
    }

    
    /// setters
    criarRegistro(id_module, name, index, search, id_curriculum) {
        return model.create({ 
            id_module, name, index, search, id_curriculum
        },{
            transaction: this._transaction
        });
    }
    atualizarRegistro(id_module, name, index, search, id_curriculum) {
        return model.update({ 
            id_module, name, index, search, id_curriculum
        },{
            where:{
                id_module
            },
            transaction: this._transaction
        });
    }

}
module.exports = ModulesRepository;