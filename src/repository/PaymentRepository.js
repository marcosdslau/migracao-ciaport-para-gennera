const model = require('../models/PaymentModel');
class PaymentRepository {
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
    criarRegistro(id_payment, id_invoice, id_payable, id_person, payment_method, type, status, amount, payment_date, numero_carga) {
        return model.create({ 
            id_payment, id_invoice, id_payable, id_person, payment_method, type, status, amount, payment_date, numero_carga
        },{
            transaction: this._transaction
        });
    }
    atualizarRegistro(id_payment, id_invoice, id_payable, id_person, payment_method, type, status, amount, payment_date, numero_carga) {
        return model.update({ 
            id_payment, id_invoice, id_payable, id_person, payment_method, type, status, amount, payment_date, numero_carga
        },{
            where:{
                id_invoice
            },
            transaction: this._transaction
        });
    }

}
module.exports = PaymentRepository;
