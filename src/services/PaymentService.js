
const PaymentRepository = require('../repository/PaymentRepository');
const connection = require('../../database/database')

class PaymentService {

    constructor(){

    }

    async Registra(id_payment, id_invoice, id_payable, id_person, payment_method, type, status, amount, payment_date, numero_carga = '1'){
        let beginTransaction = await connection.transaction();
        let paymentRepository = new PaymentRepository(beginTransaction);
        try {
            let alreadExist = await paymentRepository.BuscarPeloId(id_invoice);
            if(!alreadExist) await paymentRepository.criarRegistro(id_payment, id_invoice, id_payable, id_person, payment_method, type, status, amount, payment_date, numero_carga);
            else await paymentRepository.atualizarRegistro(id_payment, id_invoice, id_payable, id_person, payment_method, type, status, amount, payment_date, numero_carga);

            await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            await beginTransaction.rollback();
        }
    }

    async BuscaTodos(numero_carga ='1'){
        let paymentRepository = new PaymentRepository();
        try {
            const Filiations = await paymentRepository.BuscarTodas(numero_carga);
            return Filiations;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloId(id_invoice){
        let paymentRepository = new PaymentRepository();
        try {
            const dados = await paymentRepository.BuscarPeloId(id_invoice);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = PaymentService;