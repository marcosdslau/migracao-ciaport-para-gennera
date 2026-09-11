const model = require('../models/InvoicePenaltyModel');
class InvoicePenaltyRepository {
    _transaction;
    constructor(transaction = null){
        this._transaction = transaction;
    }


    async BuscarPeloId(id_invoice) {
        return await model.findOne({
            where:{id_invoice: `${id_invoice}`}
        });
    }

    async BuscarTodas(numero_carga) {
        return await model.findAll({
            where:{
                numero_carga
            }
        });
    }

    
    /// setters
    criarRegistro(id_penalty, id_invoice, amount, percentage, base_amount, numero_carga) {
        return model.create({ 
            id_penalty, id_invoice, amount, percentage, base_amount, numero_carga
        },{
            transaction: this._transaction
        });
    }
    atualizarRegistro(id_penalty, id_invoice, amount, percentage, base_amount, numero_carga) {
        return model.update({ 
            id_penalty, id_invoice, amount, percentage, base_amount, numero_carga
        },{
            where:{
                id_invoice
            },
            transaction: this._transaction
        });
    }

}
module.exports = InvoicePenaltyRepository;
