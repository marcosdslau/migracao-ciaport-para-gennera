const model = require('../models/ItemModel');
class ItemRepository {
    _transaction;
    constructor(transaction = null){
        this._transaction = transaction;
    }


    async BuscarPeloId(id_item) {
        return await model.findOne({
            where:{id_item: `${id_item}`}
        });
    }

    async BuscarTodas() {
        return await model.findAll();
    }

    
    /// setters
    criarRegistro(id_item, description, type, period, price, status, cost_center, category, search) {
        return model.create({ 
            id_item, description, type, period, price, status, cost_center, category, search
        },{
            transaction: this._transaction
        });
    }
    atualizarRegistro(id_item, description, type, period, price, status, cost_center, category, search) {
        return model.update({ 
            description, type, period, price, status, cost_center, category, search
        },{
            where:{
                id_item
            },
            transaction: this._transaction
        });
    }

}
module.exports = ItemRepository;