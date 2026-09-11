const validationId = require('../errors/error/2-validationId');
const filedsRequired = require('../errors/error/1-filedsRequired');
const isNotExist = require('../errors/error/15-validationIsNotExist');
class validateGlobal {
    Id(fields, id) {
        if (isNaN(fields[`${id}`])) {
            throw new validationId(`${id}`);
        }
        if (!fields[`${id}`]) {
            throw new filedsRequired(`${id}`);
        }
    }
    OneField(fields, field) {
        if (!fields[`${field}`]) {
            throw new filedsRequired(`${field}`);
        }
    }
    OneFieldBool(fields, field) {
        if (typeof fields[`${field}`] !== 'boolean') {
            throw new filedsRequired(`${field}`);
        }
    }
    isNotExist() {
        throw new isNotExist();
    }
}
module.exports = validateGlobal;