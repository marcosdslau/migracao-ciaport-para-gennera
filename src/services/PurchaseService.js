
const PurchaseRepository = require('../repository/PurchaseRepository');
const connection = require('../../database/database')

class PurchaseService {

    constructor(){

    }

    async Registra(id_contract, id_purchase, id_purchase_aux, id_person, id_item, installments, quantity, unit_price, date_start, date_end, date, numero_carga = '1'){
        let beginTransaction = await connection.transaction();
        let repository = new PurchaseRepository(beginTransaction);
        try {
            let alreadExist = await repository.BuscarPeloId(id_purchase_aux);
            if(!alreadExist) await repository.criarRegistro(id_contract, id_purchase, id_purchase_aux, id_person, id_item, installments, quantity, unit_price, date_start, date_end, date, numero_carga);
            else await repository.atualizarRegistro(id_contract, id_purchase, id_purchase_aux, id_person, id_item, installments, quantity, unit_price, date_start, date_end, date, numero_carga);

            await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            await beginTransaction.rollback();
        }
    }

    async BuscaTodos(numero_carga = '1'){
        let repository = new PurchaseRepository();
        try {
            const Filiations = await repository.BuscarTodas(numero_carga);
            return Filiations;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloId(id_purchase_aux){
        let repository = new PurchaseRepository();
        try {
            const dados = await repository.BuscarPeloId(id_purchase_aux);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = PurchaseService;