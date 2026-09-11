
const InvoiceRepository = require('../repository/InvoiceRepository');
const connection = require('../../database/database')

class InvoiceService {

    constructor(){

    }

    async Registra(id_purchase, id_invoice, id_invoice_aux, month_cycle, year_cycle, due_date, amount, debt_collection = false, isManual = false, numero_carga = '1'){
        let beginTransaction = await connection.transaction();
        let repository = new InvoiceRepository(beginTransaction);
        try {
            let alreadExist = await repository.BuscarPeloId(id_invoice_aux);
            if(!alreadExist) await repository.criarRegistro(id_purchase, id_invoice, id_invoice_aux, month_cycle, year_cycle, due_date, amount, debt_collection, isManual, numero_carga);
            else await repository.atualizarRegistro(id_purchase, id_invoice, id_invoice_aux, month_cycle, year_cycle, due_date, amount, debt_collection, isManual, numero_carga);

            await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            await beginTransaction.rollback();
        }
    }

    async AtualizaData(id_invoice, due_date){
        // let beginTransaction = await connection.transaction();
        let repository = new InvoiceRepository();
        try {
            await repository.atualizarDataVencimento(id_invoice, due_date);

            // await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            // await beginTransaction.rollback();
        }
    }

    async BuscaTodos(numero_carga ='1'){
        let repository = new InvoiceRepository();
        try {
            const Filiations = await repository.BuscarTodas(numero_carga);
            return Filiations;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscaTodosAutomatico(){
        let repository = new InvoiceRepository();
        try {
            const Filiations = await repository.BuscarTodasAutomatico();
            return Filiations;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscaTodosManual(){
        let repository = new InvoiceRepository();
        try {
            const Filiations = await repository.BuscarTodasManual();
            return Filiations;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloId(id_invoice_aux){
        let repository = new InvoiceRepository();
        try {
            const dados = await repository.BuscarPeloId(id_invoice_aux);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = InvoiceService;