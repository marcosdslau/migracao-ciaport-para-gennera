const model = require('../models/InvoiceModel');
class InvoiceRepository {
    _transaction;
    constructor(transaction = null){
        this._transaction = transaction;
    }


    async BuscarPeloId(id_invoice_aux) {
        return await model.findOne({
            where:{id_invoice_aux: `${id_invoice_aux}`}
        });
    }

    async BuscarTodas(numero_carga='1') {
        return await model.findAll({
            where:{
                numero_carga
            }
        });
    }

    async BuscarTodasManual() {
        return await model.findAll({
            where:{
                isManual: true
            }
        
        });
    }

    async BuscarTodasAutomatico() {
        return await model.findAll({
            where:{
                isManual: false
            }
        
        });
    }
    
    
    /// setters
    criarRegistro(id_purchase, id_invoice, id_invoice_aux, month_cycle, year_cycle, due_date, amount, debt_collection = false, isManual = false, numero_carga = '1') {
        return model.create({ 
            id_purchase, id_invoice, id_invoice_aux, month_cycle, year_cycle, due_date, amount, debt_collection, isManual, numero_carga
        },{
            transaction: this._transaction
        });
    }
    atualizarRegistro(id_purchase, id_invoice, id_invoice_aux, month_cycle, year_cycle, due_date, amount, debt_collection = false, isManual = false, numero_carga = '1') {
        return model.update({ 
            id_purchase, month_cycle, year_cycle, due_date, amount, debt_collection, isManual, numero_carga
        }, {
            where:{
                id_invoice_aux
            },
            transaction: this._transaction
        });
    }

    atualizarDataVencimento(id_purchase, due_date) {
        return model.update({ 
            due_date
        }, {
            where:{
                id_purchase
            }
        });
    }

}
module.exports = InvoiceRepository;
