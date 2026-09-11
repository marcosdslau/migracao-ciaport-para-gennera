
const InvoicePenaltyRepository = require('../repository/InvoicePenaltyRepository');
const connection = require('../../database/database')

class InvoicePenaltyService {

    constructor(){

    }

    async Registra(id_penalty, id_invoice, amount, percentage, base_amount, numero_carga = '1'){
        let beginTransaction = await connection.transaction();
        let invoicePenaltyRepository = new InvoicePenaltyRepository(beginTransaction);
        try {
            let alreadExist = await invoicePenaltyRepository.BuscarPeloId(id_invoice);
            if(!alreadExist) await invoicePenaltyRepository.criarRegistro(id_penalty, id_invoice, amount, percentage, base_amount, numero_carga);
            else await invoicePenaltyRepository.atualizarRegistro(id_penalty, id_invoice, amount, percentage, base_amount, numero_carga);

            await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            await beginTransaction.rollback();
        }
    }

    async BuscaTodos(numero_carga='1'){
        let invoicePenaltyRepository = new InvoicePenaltyRepository();
        try {
            const Filiations = await invoicePenaltyRepository.BuscarTodas(numero_carga);
            return Filiations;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloId(id_invoice){
        let invoicePenaltyRepository = new InvoicePenaltyRepository();
        try {
            const dados = await invoicePenaltyRepository.BuscarPeloId(id_invoice);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = InvoicePenaltyService;