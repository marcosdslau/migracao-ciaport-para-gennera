const express = require("express");
const Router = express.Router();
const servicesUser = require('../services/UserServices')
const authenticate = require('../../middlewares/authenticate');

Router.post('/login', async (req, res, next) => {
    const serve = new servicesUser();
    serve.login(req, next).then((authenticated)=>{
        res.status(200);
        res.json({ ...authenticated });
    }).catch((e)=>{
        next(e);
    });
});

Router.post('/validate', authenticate, (req, res, next) => {
    res.status(200);
    res.json({
        permission: true,
        master: req.isMaster,
        info: { ...req.loggedUser }
    });
});

module.exports = Router;