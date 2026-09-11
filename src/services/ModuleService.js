
const ModuleRepository = require('../repository/ModulesRepository');
const connection = require('../../database/database')

class ModuleService {

    constructor(){

    }

    async Registra(id_module, name, index, search, id_curriculum){
        let beginTransaction = await connection.transaction();
        let moduleRepository = new ModuleRepository(beginTransaction);
        try {
            let alreadExist = await moduleRepository.BuscarPeloId(id_module);
            if(!alreadExist) await moduleRepository.criarRegistro(id_module, name, index, search, id_curriculum);
            else await moduleRepository.atualizarRegistro(id_module, name, index, search, id_curriculum);

            await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            await beginTransaction.rollback();
        }
    }

    async BuscaTodos(){
        let moduleRepository = new ModuleRepository();
        try {
            const Filiations = await moduleRepository.BuscarTodas();
            return Filiations;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloId(id_module){
        let moduleRepository = new ModuleRepository();
        try {
            const dados = await moduleRepository.BuscarPeloId(id_module);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = ModuleService;