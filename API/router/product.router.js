const express = require('express');
const productRouter = express.Router();
const productController = require('../controller/product.controller');
const uploadMiddleware = require('../../middleware/upload.mid');

productRouter.get('/api/filterproduct', productController.filterProduct);
productRouter.get('/api/allproduct', productController.allProduct);
productRouter.post(
    '/api/newproduct',
    uploadMiddleware.single('image'),
    productController.createNewproduct,
);
productRouter.put(
    '/api/product/edit/:_id',
    uploadMiddleware.single('image'),
    productController.updateProduct,
);
productRouter.delete('/api/product/delete/:_id', productController.deleteProduct);

module.exports = productRouter;
