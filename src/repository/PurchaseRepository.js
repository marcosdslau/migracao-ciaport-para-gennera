const model = require('../models/PurchaseModel');
class PurchaseRepository {
    _transaction;
    constructor(transaction = null){
        this._transaction = transaction;
    }


    async BuscarPeloId(id_purchase_aux) {
        return await model.findOne({
            where:{id_purchase_aux: `${id_purchase_aux}`}
        });
    }

    async BuscarTodas(numero_carga ='1') {
        return await model.findAll({
            where:{
                numero_carga
            }
        });
    }

    
    /// setters
    criarRegistro(id_contract, id_purchase, id_purchase_aux, id_person, id_item, installments, quantity, unit_price, date_start, date_end, date, numero_carga) {
        return model.create({ 
            id_contract, id_purchase, id_purchase_aux, id_person, id_item, installments, quantity, unit_price, date_start, date_end, date, numero_carga
        },{
            transaction: this._transaction
        });
    }
    atualizarRegistro(id_contract, id_purchase, id_purchase_aux, id_person, id_item, installments, quantity, unit_price, date_start, date_end, date, numero_carga) {
        return model.update({ 
            id_contract, id_person, id_item, installments, quantity, unit_price, date_start, date_end, date, numero_carga
        }, {
            where:{
                id_purchase_aux
            },
            transaction: this._transaction
        });
    }

}
module.exports = PurchaseRepository;
