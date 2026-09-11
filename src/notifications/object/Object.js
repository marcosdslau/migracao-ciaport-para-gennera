const get = require('./Get');
const set = require('./Set');
const validateGlobal = require('../../validateGlobal')

class Model {
    constructor(icon, name, startDate, endDate, content, active) {
        this.icon = icon;
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.content = content;
        this.active = active;
        this.get = new get();
        this.set = new set();
        this.validateGlobal = new validateGlobal();
    }
}

module.exports = Model;