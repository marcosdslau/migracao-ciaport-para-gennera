const model = require('../models/ContractModel');
class ContractRepository {
    _transaction;
    constructor(transaction = null){
        this._transaction = transaction;
    }


    async BuscarPeloId(id_contract) {
        return await model.findOne({
            where:{id_contract: `${id_contract}`}
        });
    }

    async BuscarPeloIdAux(id_contract_aux) {
        return await model.findOne({
            where:{id_contract_aux: `${id_contract_aux}`}
        });
    }

    async BuscarTodas(numero_carga = '1') {
        return await model.findAll({
            where:{
                numero_carga
            }
        });
    }

    
    /// setters
    criarRegistro(id_contract, id_contract_aux, financial_responsible_person_document, id_enrollment, status, due_date, details, observation, value, method, percentage, amount, calculation_base, search, numero_carga) {
        return model.create({ 
            id_contract, id_contract_aux, financial_responsible_person_document, id_enrollment, status, due_date, details, observation, value, method, percentage, amount, calculation_base, search, numero_carga
        },{
            transaction: this._transaction
        });
    }
    atualizarRegistro(id_contract_aux, financial_responsible_person_document, id_enrollment, status, due_date, details, observation, value, method, percentage, amount, calculation_base, search, numero_carga) {
        return model.update({ 
            financial_responsible_person_document, id_enrollment, status, due_date, details, observation, value, method, percentage, amount, calculation_base, search, numero_carga
        },{
            where:{
                id_contract_aux
            },
            transaction: this._transaction
        });
    }

}
module.exports = ContractRepository;