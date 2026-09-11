const model = require('../models/UserModel');
const bcrypt = require("bcrypt");
class UserRepository {
    transaction;
    constructor(transaction = null){
        this.transaction = transaction;
    }
    id(idUser) {
        return model.findByPk(idUser, {
            attributes: ['idUser', 'name', 'email', 'status', 'master', 'operador', 'view', 'createdAt', 'updatedAt']
        });
    }
    async all() {
        return await model.findAll({ attributes: ['idUser', 'name', 'email', 'status', 'master', 'operador', 'view', 'createdAt', 'updatedAt'] });
    }
    email(email) {
        return model.findOne({ where: { email } });
    }
    
    /// setters
    add(name, email, password, status, master, operador, view) {
        return model.create({ name, email, password, status, master, operador, view });
    }
    addMaster(name, email, password, status, master) {
        return model.create({ name, email, password, status, master });
    }
    update(idUser, name, email, status, master, operador, view) {
        return model.update({
            name, email, status, master, operador, view
        }, {
            where: {
                idUser
            }
        });
    }
    updateMaster(idUser, name, email, status, master) {
        return model.update({
            name, email, status, master
        }, {
            where: {
                idUser
            }
        });
    }
    encryptPassword(password) {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    }
    updatePassword(idUser, password) {
        return model.update({
            password
        }, {
            where: {
                idUser
            }
        });
    }
    delete(idUser) {
        return model.destroy({ where: { idUser } });
    }
}
module.exports = UserRepository;