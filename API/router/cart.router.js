const express = require('express');
const cartRouter = express.Router();
const cartController = require('../controller/cart.controller');
const tokenMiddleware = require('../../middleware/token.mid');

cartRouter.post('/api/add_to_cart', tokenMiddleware.verifyTokenAndUser, cartController.addToCart);
module.exports = cartRouter;
