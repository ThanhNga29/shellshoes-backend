const ProductModel = require('../../models/product.model');
const CategoryModel = require('../../models/category.model');
const cloudinary = require('cloudinary').v2;

const productController = {
    //filter product by categories
    filterProduct: async (req, res) => {
        const id_category = req.query.id_category;
        const productList = await ProductModel.find(id_category).populate('Category');
        if (!productList) {
            res.status(500).json({
                message: 'Khong tim thay san pham',
            });
        }
        res.send(productList);
    },
    //[GET] all products.admin
    allProduct: async (req, res) => {
        try {
            const product = await ProductModel.find().populate({
                path: 'id_category',
                select: 'name_product oldPrice_product size image quantity describe detail',
            });
            res.status(200).json({
                data: product,
                sucess: true,
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({
                sucess: false,
                message: err.message,
            });
        }
    },
    //product detail.user
    productDetail: async (req, res) => {
        try {
            const productDetail = await ProductModel.findById(req.params._id).populate('category');
            if (!productDetail) {
                res.status(500).json({
                    sucess: false,
                });
            }
            res.send(productDetail);
        } catch (error) {
            res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    //[POST] /api/newproduct [admin]
    createNewproduct: async (req, res, next) => {
        try {
            //console.log(filedata);
            const id_category = await CategoryModel.findOne({ category: req.body.category });
            const newProduct = await new ProductModel({
                name_product: req.body.name_product,
                oldPrice_product: req.body.price_product,
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
            res.send(newProduct);
        } catch (error) {
            if (req.file) {
                cloudinary.uploader.destroy(req.file.filename);
            }
            res.status(500).json({ error: error.message });
        }
    },
    //[PUT] /api/product/update/:_id [ADMIN]
    updateProduct: async (req, res, next) => {
        try {
            const updatedProductData = {
                name_product: req.body.name_product,
                oldPrice_product: req.body.price_product,
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
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(200).json({
            message: 'Updated product sucessfully',
            data: updatedProduct,
        });
    },
    //[DELETE] /api/product/delete/:_id [ADMIN]
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
