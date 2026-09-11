const { Op } = require("sequelize");
const model = require('../models/IntegrateConfigModel');
class IntegrateConfigRepository {
    transaction;
    constructor(transaction = null){
        this.transaction = transaction;
    }
    async getConfig() {
        let configs = await model.findAll();
        if(configs) return configs[0];
        return null;
    }
   
    update(urlApi, intitutionCode, tokenApi, name_catraca_1, catraca_1, user_catraca_1, pass_catraca_1, name_catraca_2, catraca_2, user_catraca_2, pass_catraca_2, name_catraca_3, catraca_3, user_catraca_3, pass_catraca_3, name_catraca_4, catraca_4, user_catraca_4, pass_catraca_4, name_catraca_5, catraca_5, user_catraca_5, pass_catraca_5, name_catraca_6, catraca_6, user_catraca_6, pass_catraca_6) {
        return model.update({
            urlApi, intitutionCode, tokenApi, name_catraca_1, catraca_1, user_catraca_1, pass_catraca_1, name_catraca_2, catraca_2, user_catraca_2, pass_catraca_2, name_catraca_3, catraca_3, user_catraca_3, pass_catraca_3, name_catraca_4, catraca_4, user_catraca_4, pass_catraca_4, name_catraca_5, catraca_5, user_catraca_5, pass_catraca_5, name_catraca_6, catraca_6, user_catraca_6, pass_catraca_6
        }, {
            where: {
                id:{
                    [Op.gt]: 0,
                }
            },
            transaction: this.transaction
        });
    }
}
module.exports = IntegrateConfigRepository;