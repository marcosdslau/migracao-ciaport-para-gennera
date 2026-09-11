
const InvoiceDiscountRepository = require('../repository/InvoiceDiscountRepository');
const connection = require('../../database/database')

class InvoiceDiscountService {

    constructor(){

    }

    async Registra(id_discount, id_invoice, id_type_discount, type, event, amount, numero_carga = '1'){
        let beginTransaction = await connection.transaction();
        let invoiceDiscountRepository = new InvoiceDiscountRepository(beginTransaction);
        try {
            let alreadExist = await invoiceDiscountRepository.BuscarPeloId(id_invoice);
            if(!alreadExist) await invoiceDiscountRepository.criarRegistro(id_discount, id_invoice, id_type_discount, type, event, amount, numero_carga);
            else await invoiceDiscountRepository.atualizarRegistro(id_discount, id_invoice, id_type_discount, type, event, amount, numero_carga);

            await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            await beginTransaction.rollback();
        }
    }

    async BuscaTodos(numero_carga ='1'){
        let invoiceDiscountRepository = new InvoiceDiscountRepository();
        try {
            const Filiations = await invoiceDiscountRepository.BuscarTodas(numero_carga);
            return Filiations;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloId(id_invoice){
        let invoiceDiscountRepository = new InvoiceDiscountRepository();
        try {
            const dados = await invoiceDiscountRepository.BuscarPeloId(id_invoice);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = InvoiceDiscountService;