const jwt = require('jsonwebtoken');
const secretKey = 'asdfqwerzxcv';
const UserRepository = require('../src/repository/UserRepository');
const menu = require('../rootMenu');

module.exports = (req, res, next) => {
    const authToken = req.headers['x-access-token'];

    if (authToken != undefined) {
        jwt.verify(authToken, secretKey, async (err, data) => {
            if (err) {
                try {
                    throw new Error("Token Inválido!")
                } catch (e) {
                    next(e);
                }
            } else {
                const userRepository = new UserRepository();
                const userModel = await userRepository.id(data.idUser);
                if (!userModel.status) {
                    console.log('Usuário inativo')
                    try {
                        throw new Error("Usuário Invativo")
                    } catch (e) {
                        next(e);
                    }
                }
                if (data.master) {
                    req.isMaster = data.master;
                    req.loggedUser = {
                        idUser: data.idUser,
                        email: data.email,
                        Username: data.UserName,
                        permissions: {
                            'menu': menu,
                        }
                    };
                    next();
                } else{

                }
            }
        })

    } else {
        try {
            throw new Error("Token Inválido!")
        } catch (e) {
            next(e);
        }
    }
}