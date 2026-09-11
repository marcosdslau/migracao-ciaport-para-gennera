const model = require('../NotificationsModel');
class set {
    add(icon, name, startDate, endDate, content, active) {
        return model.create({ icon, name, startDate, endDate, content, active });
    }
    update(idNotification, startDate, endDate, content, active) {
        return model.update({
            startDate, endDate, content, active
        }, {
            where: {
                idNotification
            }
        });
    }
    delete(idNotification) {
        return model.destroy({ where: { idNotification } });
    }
}
module.exports = set;