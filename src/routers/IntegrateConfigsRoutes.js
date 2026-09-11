const express = require("express");
const Router = express.Router();
const IntegrateConfigServices = require('../services/IntegrateConfigServices')
const authenticate = require('../../middlewares/authenticate');
const returns = require('../defaultReturns');
const connection = require('../../database/database');
const IntegrateConfigRepository = require('../repository/IntegrateConfigRepository');

Router.get('/configs', authenticate, async (req, res, next) => {
    const repository = new IntegrateConfigRepository();
    const serve = new IntegrateConfigServices(repository);
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

Router.put('/configs', async (req, res, next) => {
    const beginTransaction = await connection.transaction();
    const repository = new IntegrateConfigRepository(beginTransaction);
    const serve = new IntegrateConfigServices(repository);
    serve.update(req, next).then(async (data)=>{
        await beginTransaction.commit()
        res.status(200);
        res.json({
            message: returns('update'),
        });
    }).catch(async (e)=>{
        await beginTransaction.rollback()
        next(e);
    });
});

module.exports = Router;