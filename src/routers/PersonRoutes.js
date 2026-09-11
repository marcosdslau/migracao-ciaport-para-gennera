const express = require("express");
const Router = express.Router();
const PersonService = require('../services/PersonService')
const authenticate = require('../../middlewares/authenticate');
const returns = require('../defaultReturns');

Router.get('/persons', authenticate, async (req, res, next) => {
    const serve = new PersonService();
    const limit = parseInt(`${req.query.limit}`);
    const offset = parseInt(`${req.query.offset}`);

    serve.BuscarPessoasPorPagina(limit, offset).then((data)=>{
        res.status(200);
        res.json({
            message: returns('get', data),
            data: data
        });
    }).catch((e)=>{
        next(e);
    });
});

Router.get('/total-persons', authenticate, async (req, res, next) => {
    const serve = new PersonService();
    serve.BuscarTotalPessoas(req, next).then((data)=>{
        res.status(200);
        res.json({
            message: returns('get', data),
            data: data
        });
    }).catch((e)=>{
        next(e);
    });
});

// Router.get('/persons/:idUser', authenticate, async (req, res, next) => {
//     const serve = new PersonService();
//     serve.get_id(req, next).then((data)=>{
//         res.status(200);
//         res.json({
//             message: returns('get', data),
//             data: data
//         });
//     }).catch((e)=>{
//         next(e);
//     });
// });

Router.post('/persons-integrar', async (req, res, next) => {
    const serve = new PersonService();
    serve.IntegrarPessoasDoGennera().then((data)=>{
        res.status(200);
        res.json({
            message: returns('post'),
            data: data
        });
    }).catch((e)=>{
        next(e);
    });
});

// Router.put('/persons/:idUser', async (req, res, next) => {
//     const serve = new PersonService();
//     serve.update(req, next).then((data)=>{
//         res.status(200);
//         res.json({
//             message: returns('update'),
//         });
//     }).catch((e)=>{
//         next(e);
//     });
// });

// Router.patch('/persons/:idUser', async (req, res, next) => {
//     const serve = new PersonService();
//     serve.updatePassword(req, next).then((data)=>{
//         res.status(200);
//         res.json({
//             message: returns('update'),
//         });
//     }).catch((e)=>{
//         next(e);
//     });
// });

// Router.delete('/persons/:idUser', async (req, res, next) => {
//     const serve = new PersonService();
//     serve.delete(req, next).then((data)=>{
//         res.status(200);
//         res.json({
//             message: returns('delete'),
//         });
//     }).catch((e)=>{
//         next(e);
//     });
// });
module.exports = Router;