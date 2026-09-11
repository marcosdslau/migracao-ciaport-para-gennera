
const DiscountRepository = require('../repository/DiscountRepository');
const connection = require('../../database/database')

class DiscountService {

    constructor(){

    }

    async Registra(id_type_discount, category, description, type, fiscal_type, condition, value, method, percentage, amount, calculation_base, status, search){
        let beginTransaction = await connection.transaction();
        let discountRepository = new DiscountRepository(beginTransaction);
        try {
            let alreadExist = await discountRepository.BuscarPeloId(id_type_discount);
            if(!alreadExist) await discountRepository.criarRegistro(id_type_discount, category, description, type, fiscal_type, condition, value, method, percentage, amount, calculation_base, status, search);
            else await discountRepository.atualizarRegistro(id_type_discount, category, description, type, fiscal_type, condition, value, method, percentage, amount, calculation_base, status, search);

            await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            await beginTransaction.rollback();
        }
    }

    async BuscaTodos(){
        let discountRepository = new DiscountRepository();
        try {
            const Filiations = await discountRepository.BuscarTodas();
            return Filiations;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloId(id_type_discount){
        let discountRepository = new DiscountRepository();
        try {
            const dados = await discountRepository.BuscarPeloId(id_type_discount);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = DiscountService;