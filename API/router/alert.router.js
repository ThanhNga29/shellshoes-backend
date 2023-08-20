const express = require('express');
const alertRouter = express.Router();
const alertController = require('../controller/alert.controller');
const tokenMiddleware = require('../../middleware/token.mid');

alertRouter.post(
    '/api/order/alert/confirm',
    tokenMiddleware.verifyTokenAndUserAuthor,
    alertController.alertConfirm,
);
alertRouter.post(
    '/api/order/alert/shipped',
    tokenMiddleware.verifyTokenAndUserAuthor,
    alertController.alertShipped,
);
alertRouter.post(
    '/api/order/alert/delivered',
    tokenMiddleware.verifyTokenAndUserAuthor,
    alertController.alertDelivered,
);
alertRouter.get('/api/alert/all', tokenMiddleware.verifyTokenAndUser, alertController.alertAll);
module.exports = alertRouter;
