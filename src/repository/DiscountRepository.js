const model = require('../models/DiscountModel');
class DiscountRepository {
    _transaction;
    constructor(transaction = null){
        this._transaction = transaction;
    }


    async BuscarPeloId(id_type_discount) {
        return await model.findOne({
            where:{id_type_discount: `${id_type_discount}`}
        });
    }

    async BuscarTodas() {
        return await model.findAll();
    }

    
    /// setters
    criarRegistro(id_type_discount, category, description, type, fiscal_type, condition, value, method, percentage, amount, calculation_base, status, search) {
        return model.create({ 
            id_type_discount, category, description, type, fiscal_type, condition, value, method, percentage, amount, calculation_base, status, search
        },{
            transaction: this._transaction
        });
    }
    atualizarRegistro(id_type_discount, category, description, type, fiscal_type, condition, value, method, percentage, amount, calculation_base, status, search) {
        return model.update({ 
            category, description, type, fiscal_type, condition, value, method, percentage, amount, calculation_base, status, search
        },{
            where:{
                id_type_discount
            },
            transaction: this._transaction
        });
    }

}
module.exports = DiscountRepository;