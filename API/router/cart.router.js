const express = require('express');
const cartRouter = express.Router();
const cartController = require('../controller/cart.controller');
const tokenMiddleware = require('../../middleware/token.mid');

cartRouter.post('/api/add_to_cart', tokenMiddleware.verifyTokenAndUser, cartController.addToCart);
cartRouter.delete(
    '/api/cart/delete/:_id',
    tokenMiddleware.verifyTokenAndUser,
    cartController.deleteProductInCart,
);
cartRouter.get('/api/cart', tokenMiddleware.verifyTokenAndUser, cartController.getCartProduct);
cartRouter.put('/api/cart/edit/:_id', tokenMiddleware.verifyTokenAndUser, cartController.editCart);

module.exports = cartRouter;
