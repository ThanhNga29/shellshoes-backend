const express = require('express');
const orderRouter = express.Router();
const orderController = require('../controller/order.controller');

orderRouter.post('/api/order/create', orderController.createOrderProduct);

module.exports = orderRouter;
