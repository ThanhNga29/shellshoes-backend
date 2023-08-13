const express = require('express');
const orderRouter = express.Router();
const orderController = require('../controller/order.controller');
const tokenMiddleware = require('../../middleware/token.mid');

orderRouter.post(
    '/api/order/create',
    tokenMiddleware.verifyTokenAndUserAuthor,
    orderController.createOrderProduct,
);
orderRouter.get(
    '/api/user/purchase',
    tokenMiddleware.verifyTokenAndUser,
    orderController.getOrderByUser,
);
orderRouter.delete(
    '/api/order/delete/:_id',
    tokenMiddleware.verifyTokenAndUserAuthor,
    orderController.deleteOrder,
);
orderRouter.get('/api/order/all', tokenMiddleware.verifyTokenAndAdmin, orderController.getAllOrder);
module.exports = orderRouter;
