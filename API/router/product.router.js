const express = require('express');
const productRouter = express.Router();
const productController = require('../controller/product.controller');
const tokenMiddleware = require('../../middleware/token.mid');
const uploadMiddleware = require('../../middleware/upload.mid');

productRouter.get(
    '/api/filterproduct',
    //tokenMiddleware.verifyTokenAndUserAuthor,
    productController.filterProduct,
);
productRouter.get(
    '/api/product/detail/:_id',
    //tokenMiddleware.verifyTokenAndUserAuthor,
    productController.detailProduct,
);
productRouter.get(
    '/api/allproduct',
    //tokenMiddleware.verifyTokenAndAdmin,
    productController.allProduct,
);
productRouter.post(
    '/api/newproduct',
    uploadMiddleware.array('image'),
    productController.createNewproduct,
);
productRouter.put(
    '/api/product/edit/:_id',
    tokenMiddleware.verifyTokenAndAdmin,
    uploadMiddleware.array('image'),
    productController.updateProduct,
);
productRouter.delete(
    '/api/product/delete/:_id',
    tokenMiddleware.verifyTokenAndAdmin,
    productController.deleteProduct,
);
productRouter.get('/api/search', productController.searchProduct);
productRouter.get('/api/checkstock', productController.checkStock);
productRouter.get('/api/home', productController.productHomePage);
productRouter.get('/api/products/:page', productController.productPagination);
module.exports = productRouter;
