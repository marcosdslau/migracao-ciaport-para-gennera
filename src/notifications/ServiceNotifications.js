const obj = require('./object/Object');
const format = require('../tasks/formatDateTasks');
class service {
    get_all(req) {
        const client = new obj();
        let startDate = null;
        let endDate = null;
        if (req.query.startDate && req.query.endDate && req.query.search === 'false') {
            startDate = format.startDate(req.query.startDate);
            endDate = format.endDate(req.query.endDate);
            return client.get.all(startDate, endDate);
        }
        if (req.query.startDate && req.query.endDate && req.query.search === 'true') {
            startDate = format.startDate(req.query.startDate);
            endDate = format.endDate(req.query.endDate);
            return client.get.search(startDate, endDate);
        }
        return [];
    }
    get_id(req) {
        const client = new obj();
        const idNotification = parseInt(req.params.idNotification);
        client.validateGlobal.Id(req.params, 'idNotification');
        return client.get.id(idNotification);
    }
    get_notifications_currents(req) {
        const client = new obj();
        let date = format.startDate(req.query.date);
        return client.get.current(date);
    }
    add(req) {
        let { icon, startDate, endDate, content, active } = req.body;
        const name = icon.name;
        const client = new obj();
        client.validateGlobal.OneField(req.body, 'icon');
        client.validateGlobal.OneField(req.body, 'startDate');
        client.validateGlobal.OneField(req.body, 'endDate');
        client.validateGlobal.OneField(req.body, 'content');
        let newStartDate = `${startDate.split('/')[2]}-${startDate.split('/')[1]}-${startDate.split('/')[0]}`;
        let newEndDate = `${endDate.split('/')[2]}-${endDate.split('/')[1]}-${endDate.split('/')[0]}`;
        return client.set.add(icon, name.toUpperCase(), newStartDate, newEndDate, content, active);
    }
    update(req) {
        let { startDate, endDate, content, active } = req.body;
        const client = new obj();
        client.validateGlobal.OneField(req.body, 'startDate');
        client.validateGlobal.OneField(req.body, 'endDate');
        client.validateGlobal.OneField(req.body, 'content');
        const idNotification = parseInt(req.params.idNotification);
        client.validateGlobal.Id(req.params, 'idNotification');
        let newStartDate = `${startDate.split('/')[2]}-${startDate.split('/')[1]}-${startDate.split('/')[0]}`;
        let newEndDate = `${endDate.split('/')[2]}-${endDate.split('/')[1]}-${endDate.split('/')[0]}`;
        return client.set.update(idNotification, newStartDate, newEndDate, content, active);
    }
    delete(req) {
        const client = new obj();
        const idNotification = parseInt(req.params.idNotification);
        client.validateGlobal.Id(req.params, 'idNotification');
        return client.set.delete(idNotification);
    }
}

module.exports = service;