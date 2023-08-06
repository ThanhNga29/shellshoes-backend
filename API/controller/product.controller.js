const ProductModel = require('../../models/product.model');
const CategoryModel = require('../../models/category.model');
const cloudinary = require('cloudinary').v2;

const productController = {
    // api/filterproduct
    filterProduct: async (req, res) => {
        try {
            const id_category = req.query._id;
            const productList = await ProductModel.find({ id_category: id_category })
                .populate('id_category')
                .exec();
            if (!id_category) {
                return res.status(404).json({
                    sucess: false,
                    message: 'The category not found!',
                });
            }
            if (!productList || productList.length === 0) {
                res.status(404).json({
                    sucess: false,
                    message: 'No products found in this category',
                });
            }
            return res.status(200).json({
                sucess: true,
                data: productList,
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    //[GET] api/allproduct
    allProduct: async (req, res) => {
        try {
            const product = await ProductModel.find().populate({
                path: 'id_category',
                select: 'name_product oldPrice_product newPrice_product size image quantity describe detail',
            });
            return res.status(200).json({
                data: product,
                sucess: true,
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                sucess: false,
                message: err.message,
            });
        }
    },
    // api/product/detail/:_id
    productDetail: async (req, res) => {
        try {
            const productDetail = await ProductModel.findById(req.params._id);
            if (!productDetail) {
                res.status(404).json({
                    sucess: false,
                    message: 'The product not found!',
                });
            }
            return res.status(200).json({
                sucess: true,
                data: productDetail,
            });
        } catch (error) {
            res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    //[POST] /api/newproduct
    createNewproduct: async (req, res, next) => {
        try {
            //console.log(filedata);
            const id_category = await CategoryModel.findOne({ category: req.body.category });
            const newProduct = await new ProductModel({
                name_product: req.body.name_product,
                oldPrice_product: req.body.oldPrice_product,
                newPrice_Product: req.body.newPrice_product,
                size: req.body.size,
                image: req.file.path,
                quantity: req.body.quantity,
                describe: req.body.describe,
                detail: req.body.detail,
                id_category: id_category._id,
            });
            const product = await newProduct.save();
            // if (!newProduct) {
            //     res.status(500).send('the product cannot be created');
            // }
            return res.status(200).send(newProduct);
        } catch (error) {
            if (req.file) {
                cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(500).json({ error: error.message });
        }
    },
    //[PUT] /api/product/edit/:_id
    updateProduct: async (req, res, next) => {
        try {
            const updatedProductData = {
                name_product: req.body.name_product,
                oldPrice_product: req.body.oldPrice_product,
                newPrice_product: req.body.newPrice_product,
                size: req.body.size,
                image: req.file.path,
                quantity: req.body.quantity,
                describe: req.body.describe,
                detail: req.body.detail,
            };
            const conditionalProductData = {
                _id: req.params._id,
            };
            const updatedProduct = await ProductModel.findOneAndUpdate(
                conditionalProductData,
                updatedProductData,
                {
                    new: true,
                },
            );
            return res.status(200).json({
                message: 'Updated product sucessfully',
                data: updatedProduct,
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },
    //[DELETE] /api/product/delete/:_id
    deleteProduct: async (req, res, next) => {
        try {
            const deleteProduct = await ProductModel.findByIdAndRemove(req.params._id);
            if (deleteProduct) {
                return res.status(200).json({
                    sucess: true,
                    message: 'The product is deleted!',
                });
            } else {
                return res.status(404).json({
                    sucess: false,
                    message: 'The product not found!',
                });
            }
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
};

module.exports = productController;
