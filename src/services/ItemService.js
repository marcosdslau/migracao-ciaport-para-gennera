
const ItemRepository = require('../repository/ItemRepository');
const connection = require('../../database/database')

class ItemService {

    constructor(){

    }

    async Registra(id_item, description, type, period, price, status, cost_center, category, search){
        let beginTransaction = await connection.transaction();
        let itemRepository = new ItemRepository(beginTransaction);
        try {
            let alreadExist = await itemRepository.BuscarPeloId(id_item);
            if(!alreadExist) await itemRepository.criarRegistro(id_item, description, type, period, price, status, cost_center, category, search);
            else await itemRepository.atualizarRegistro(id_item, description, type, period, price, status, cost_center, category, search);

            await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            await beginTransaction.rollback();
        }
    }

    async BuscaTodos(){
        let itemRepository = new ItemRepository();
        try {
            const Filiations = await itemRepository.BuscarTodas();
            return Filiations;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloId(id_item){
        let itemRepository = new ItemRepository();
        try {
            const dados = await itemRepository.BuscarPeloId(id_item);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = ItemService;