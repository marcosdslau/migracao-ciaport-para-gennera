const model = require('../models/InvoiceDiscountModel');
class InvoiceDiscountRepository {
    _transaction;
    constructor(transaction = null){
        this._transaction = transaction;
    }


    async BuscarPeloId(id_invoice) {
        return await model.findOne({
            where:{id_invoice: `${id_invoice}`}
        });
    }

    async BuscarTodas(numero_carga='1') {
        return await model.findAll({
            where:{
                numero_carga
            }
        });
    }

    
    /// setters
    criarRegistro(id_discount, id_invoice, id_type_discount, type, event, amount, numero_carga) {
        return model.create({ 
            id_discount, id_invoice, id_type_discount, type, event, amount, numero_carga
        },{
            transaction: this._transaction
        });
    }
    atualizarRegistro(id_discount, id_invoice, id_type_discount, type, event, amount, numero_carga) {
        return model.update({ 
            id_discount, id_invoice, id_type_discount, type, event, amount, numero_carga
        },{
            where:{
                id_invoice
            },
            transaction: this._transaction
        });
    }

}
module.exports = InvoiceDiscountRepository;


