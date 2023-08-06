const express = require('express');
const productRouter = express.Router();
const productController = require('../controller/product.controller');
const tokenMiddleware = require('../../middleware/token.mid');
const uploadMiddleware = require('../../middleware/upload.mid');

productRouter.get(
    '/api/filterproduct',
    tokenMiddleware.verifyTokenAndUserAuthor,
    productController.filterProduct,
);
productRouter.get(
    '/api/product/detail/:_id',
    tokenMiddleware.verifyTokenAndUserAuthor,
    productController.productDetail,
);
productRouter.get(
    '/api/allproduct',
    tokenMiddleware.verifyTokenAndAdmin,
    productController.allProduct,
);
productRouter.post(
    '/api/newproduct',
    uploadMiddleware.single('image'),
    productController.createNewproduct,
);
productRouter.put(
    '/api/product/edit/:_id',
    //tokenMiddleware.verifyTokenAndAdmin,
    uploadMiddleware.single('image'),
    productController.updateProduct,
);
productRouter.delete(
    '/api/product/delete/:_id',
    tokenMiddleware.verifyTokenAndAdmin,
    productController.deleteProduct,
);

module.exports = productRouter;
