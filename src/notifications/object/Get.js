const model = require('../NotificationsModel');
const { Op } = require("sequelize");
class get {
    id(value) {
        return model.findByPk(value);
    }
    all(startDate, endDate) {
        return model.findAll({
            where: {
                createdAt: { [Op.between]: [startDate, endDate] }
            },
            order: [['endDate', 'DESC']],
            limit: 1000
        });
    }
    search(startDate, endDate) {
        return model.findAll({
            where: {
                startDate: { [Op.gte]: startDate },
                endDate: { [Op.lte]: endDate }
            },
            order: [['endDate', 'DESC']],
            limit: 1000
        });
    }
    current(date) {
        return model.findAll({
            where: {
                [Op.and]: [{
                    startDate: { [Op.lte]: date }
                }, {
                    endDate: { [Op.gte]: date }
                }],
                active: true
            },
            order: [['endDate', 'DESC']],
            limit: 1000
        });
    }
}
module.exports = get;