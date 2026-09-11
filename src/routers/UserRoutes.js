const express = require("express");
const Router = express.Router();
const servicesUser = require('../services/UserServices')
const authenticate = require('../../middlewares/authenticate');
const returns = require('../defaultReturns');

Router.get('/users', authenticate, async (req, res, next) => {
    const serve = new servicesUser();
    serve.get_all(req, next).then((data)=>{
        res.status(200);
        res.json({
            message: returns('get', data),
            data: data
        });
    }).catch((e)=>{
        next(e);
    });
});

Router.get('/users/:idUser', authenticate, async (req, res, next) => {
    const serve = new servicesUser();
    serve.get_id(req, next).then((data)=>{
        res.status(200);
        res.json({
            message: returns('get', data),
            data: data
        });
    }).catch((e)=>{
        next(e);
    });
});

Router.post('/users', async (req, res, next) => {
    const serve = new servicesUser();
    serve.add(req, next).then((data)=>{
        res.status(200);
        res.json({
            message: returns('post'),
            data: data
        });
    }).catch((e)=>{
        next(e);
    });
});

Router.put('/users/:idUser', async (req, res, next) => {
    const serve = new servicesUser();
    serve.update(req, next).then((data)=>{
        res.status(200);
        res.json({
            message: returns('update'),
        });
    }).catch((e)=>{
        next(e);
    });
});

Router.patch('/users/:idUser', async (req, res, next) => {
    const serve = new servicesUser();
    serve.updatePassword(req, next).then((data)=>{
        res.status(200);
        res.json({
            message: returns('update'),
        });
    }).catch((e)=>{
        next(e);
    });
});

Router.delete('/users/:idUser', async (req, res, next) => {
    const serve = new servicesUser();
    serve.delete(req, next).then((data)=>{
        res.status(200);
        res.json({
            message: returns('delete'),
        });
    }).catch((e)=>{
        next(e);
    });
});
module.exports = Router;