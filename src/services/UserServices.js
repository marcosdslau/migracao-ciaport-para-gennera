
const UserRepository = require('../repository/UserRepository');

const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const secretKey = 'asdfqwerzxcv';

class UserServices {
    async login(req, next) {
        try {
            const { email, password } = req.body;
            if (!email) throw Error('email não informado');
            if (!password) throw new Error('password não informado');

            const repository = new UserRepository();
            const auth = await repository.email(email);

            if(!auth.status) throw new Error("Usuário Inativo");
            if(auth == undefined) throw new Error("Usuário Não Existe");


            const authTrue = bcrypt.compareSync(password, auth.password);
            if (authTrue) {
                const token = jwt.sign({
                    idUser: auth.idUser,
                    email: auth.email,
                    UserName: auth.name,
                    master: auth.master,
                    operador: auth.operador,
                    view: auth.view,
                }, secretKey);
                return {
                    idUser: auth.idUser,
                    email: auth.email,
                    UserName: auth.name,
                    master: auth.master,
                    token: token
                }
            }
            return false;
        } catch (error) {
            next(error)
        }
    }
    async get_all() {
        const repository = new UserRepository();
        const users = await repository.all();
        return users.filter(u => u.email != 'master@integrate.com');
    }
    async get_id(req) {
        const repository = new UserRepository();
        const idUser = parseInt(req.params.idUser);
        if(!idUser) throw new Error("idUser inválido!")
        let userModel = await repository.id(idUser);
        if(userModel == null) throw new Error("Usuário não localizado!");
        return userModel;
    }

    async add(req) {
        const { name, email, password, status, master, operador, view } = req.body;

        if(!name) throw new Error("é Obrigatório informar o nome");
        if(!email) throw new Error("é Obrigatório informar o email");
        if(!password) throw new Error("é Obrigatório informar a senha");
        const repository = new UserRepository();
        let alreadExist = await repository.email(email);
        if(alreadExist) throw new Error("Usuário já existe!");

        const newPass = repository.encryptPassword(password);
        return await repository.add(name, email, newPass, status, master, operador, view);
    }
    async update(req) {
        const { name, email, status, master, operador, view } = req.body;

        if(!name) throw new Error("é Obrigatório informar o nome");
        if(!email) throw new Error("é Obrigatório informar o email");
        const idUser = parseInt(req.params.idUser);
        if(!idUser) throw new Error("idUser inválido!")

        const repository = new UserRepository();

        return await repository.update(idUser, name, email, status, master, operador, view);
    }
    async asyncupdatePassword(req) {
        const { password } = req.body;
        const repository = new UserRepository();
        
        const idUser = parseInt(req.params.idUser);
        if(!idUser) throw new Error("idUser inválido!")
        if(!password) throw new Error("é obrigatporio informar a senha!")

        const newPass = repository.encryptPassword(password);
        return await repository.updatePassword(idUser, newPass);
    }

    async delete(req) {
        const idUser = parseInt(req.params.idUser);
        if(!idUser) throw new Error("idUser inválido!")

        const repository = new UserRepository();
       
        return await repository.delete(idUser);

    }
}

module.exports = UserServices;