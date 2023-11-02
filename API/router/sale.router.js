const express = require('express');
const saleRouter = express.Router();
const saleController = require('../controller/sale.controller');

saleRouter.post('/api/createSale', saleController.createSale);

module.exports = saleRouter;
