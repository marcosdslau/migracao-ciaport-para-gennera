const express = require("express");
const Router = express.Router();
const returns = require('../defaultReturns');
const service = require('./ServiceNotifications');
const authenticate = require('../../middlewares/authenticate');

Router.get('/currents/notifications', authenticate, async (req, res, next) => {
    // #swagger.tags = ['Notifications']
    // #swagger.description = 'Busca todas as Notifications Vigentes.'
    let data = [];
    try {
        const serve = new service();
        data = await serve.get_notifications_currents(req);
        res.status(200);
        res.json({
            message: returns('get', data),
            data: data
        });
    } catch (e) {
        next(e);
    }
});

Router.get('/notifications', authenticate, async (req, res, next) => {
    // #swagger.tags = ['Notifications']
    // #swagger.description = 'Busca todas as Notifications.'
    let data = [];
    try {
        const serve = new service();
        data = await serve.get_all(req);
        res.status(200);
        res.json({
            message: returns('get', data),
            data: data
        });
    } catch (e) {
        next(e);
    }
});

Router.get('/notifications/:idNotification', authenticate, async (req, res, next) => {
    // #swagger.tags = ['Notifications']
    // #swagger.description = 'Busca pelo id a Notification.'
    let data = [];
    try {
        const serve = new service();
        data = await serve.get_id(req);
        res.status(200);
        res.json({
            message: returns('get', data),
            data: data
        });
    } catch (e) {
        next(e);
    }
});

Router.post('/notifications', authenticate, async (req, res, next) => {
    // #swagger.tags = ['Notifications']
    // #swagger.description = 'Registra uma nova Notification.'
    let data = [];
    try {
        const serve = new service();
        data = await serve.add(req);
        res.status(200);
        res.json({
            message: returns('post'),
            data: data
        });
    } catch (e) {
        next(e);
    }
});

Router.put('/notifications/:idNotification', authenticate, async (req, res, next) => {
    // #swagger.tags = ['Notifications']
    // #swagger.description = 'Atualiza uma Notification.'
    let data = [];
    try {
        const serve = new service();
        data = await serve.update(req);
        res.status(200);
        res.json({
            message: returns('update'),
            data: data
        });
    } catch (e) {
        next(e);
    }
});

;
Router.delete('/notifications/:idNotification', authenticate, async (req, res, next) => {
    // #swagger.tags = ['Notifications']
    // #swagger.description = 'Exclui uma Notification.'
    try {
        const serve = new service();
        await serve.delete(req);
        res.status(200);
        res.json({
            message: returns('delete'),
            data: []
        });
    } catch (e) {
        next(e);
    }
});

module.exports = Router;