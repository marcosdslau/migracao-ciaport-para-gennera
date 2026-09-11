
const ContractRepository = require('../repository/ContractRepository');
const connection = require('../../database/database')

class ContractService {

    constructor(){

    }

    async Registra(id_contract, id_contract_aux, financial_responsible_person_document, id_enrollment, status, due_date, details, observation, value, method, percentage, amount, calculation_base, search, numero_carga = '1'){
        let beginTransaction = await connection.transaction();
        let contractRepository = new ContractRepository(beginTransaction);
        try {
            let alreadExist = await contractRepository.BuscarPeloIdAux(id_contract_aux);
            if(!alreadExist) await contractRepository.criarRegistro(id_contract, id_contract_aux, financial_responsible_person_document, id_enrollment, status, due_date, details, observation, value, method, percentage, amount, calculation_base, search, numero_carga);
            else await contractRepository.atualizarRegistro(id_contract_aux, financial_responsible_person_document, id_enrollment, status, due_date, details, observation, value, method, percentage, amount, calculation_base, search, numero_carga);

            await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            await beginTransaction.rollback();
        }
    }

    async BuscaTodos(numero_carga = '1'){
        let contractRepository = new ContractRepository();
        try {
            const Filiations = await contractRepository.BuscarTodas(numero_carga);
            return Filiations;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloId(id_contract){
        let contractRepository = new ContractRepository();
        try {
            const dados = await contractRepository.BuscarPeloId(id_contract);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloIdAux(id_contract_aux){
        let contractRepository = new ContractRepository();
        try {
            const dados = await contractRepository.BuscarPeloIdAux(id_contract_aux);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = ContractService;