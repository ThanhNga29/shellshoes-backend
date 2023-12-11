const express = require('express');
const statisticalRouter = express.Router();
const statisticalController = require('../controller/statistical.controller');

statisticalRouter.get('/api/monthly/revenue', statisticalController.monthlyRevenue);
statisticalRouter.get('/api/request/revenue', statisticalController.requestRevenue);
statisticalRouter.get('/api/total/revenue', statisticalController.totalRevenue);
statisticalRouter.get('/api/order/number', statisticalController.orderNumber);
statisticalRouter.get('/api/user/number', statisticalController.userNumber);
statisticalRouter.get('/api/monthly/user', statisticalController.monthlyUser);
statisticalRouter.get('/api/sell/number', statisticalController.sellNumber);
statisticalRouter.get('/api/ten/high/revenue', statisticalController.topTenHighestRevenueProducts);
module.exports = statisticalRouter;
