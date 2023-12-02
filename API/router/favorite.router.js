const express = require('express');
const favoriteRouter = express.Router();
const favoriteController = require('../controller/favorite.controller');
const tokenMiddleware = require('../../middleware/token.mid');

favoriteRouter.post(
    '/api/favorite',
    tokenMiddleware.verifyTokenAndUser,
    favoriteController.postFavorite,
);
favoriteRouter.delete(
    '/api/delete/favorite',
    tokenMiddleware.verifyTokenAndUser,
    favoriteController.deleteFavorite,
);
favoriteRouter.get(
    '/api/all/favorite',
    tokenMiddleware.verifyTokenAndUser,
    favoriteController.allFavorite,
);
favoriteRouter.get('/api/product/favorite', favoriteController.mostProductFavorite);
//favoriteRouter('/api/delete/favorite', tokenMiddleware.verifyTokenAndUser);
module.exports = favoriteRouter;
