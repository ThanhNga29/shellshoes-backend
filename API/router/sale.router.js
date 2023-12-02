const express = require('express');
const saleRouter = express.Router();
const saleController = require('../controller/sale.controller');

saleRouter.post('/api/createSale', saleController.createSale);
saleRouter.put('/api/update/sale/:_id', saleController.updateSale);
saleRouter.delete('/api/delete/sale/:_id', saleController.deleteSale);
//saleRouter.post('/api/test', saleController.checkSaleOneProduct);
saleRouter.get('/api/all/sale', saleController.checkConflictProductSale);
saleRouter.get('/api/detail/sale/:_id', saleController.detailSaleProduct);
saleRouter.get('/api/sale/completed', saleController.saleCompleted);
saleRouter.get('/api/sale/active', saleController.saleActive);
saleRouter.get('/api/sale/upcoming', saleController.saleUpcoming);
module.exports = saleRouter;
