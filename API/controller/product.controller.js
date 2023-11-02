const ProductModel = require('../../models/product.model');
const CategoryModel = require('../../models/category.model');
const cloudinary = require('cloudinary').v2;
const { checkSaleProduct } = require('./sale.controller');

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
            const product = await ProductModel.find();
            console.log(product);
            //     .populate({
            //     path: 'id_category',
            //     select: 'name_product price_product size image quantity describe detail',
            // });
            //console.log(product);
            // return res.status(200).json({
            //     data: product,
            //     sucess: true,
            // });
            const data = await checkSaleProduct(product);
            for (const product of data) {
                if (product.matchingSale) {
                    product.salePrice = product.matchingSale.saleProducts[0].salePrice;
                }
                try {
                    const updatedProduct = await ProductModel.findByIdAndUpdate(
                        product._id,
                        { salePrice: product.salePrice },
                        { new: true },
                    );
                    if (updatedProduct) {
                        console.log(
                            `SalePrice of product '${updatedProduct.name_product}' updated to ${updatedProduct.salePrice}`,
                        );
                    }
                } catch (error) {
                    console.error(
                        `Error updating product '${product.name_product}': ${error.message}`,
                    );
                }
            }
            return res.status(200).json({
                sucess: true,
                data: data,
            });
        } catch (err) {
            //console.log(err);
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
            //console.log(req.body.sizes);
            const id_category = await CategoryModel.findOne({ category: req.body.category });
            const sizes = JSON.parse(req.body.sizes);
            //console.log(sizes);
            const newSizeProduct = sizes.map((size) => ({
                size: size.size,
                quantity: size.quantity,
            }));
            const newProduct = await new ProductModel({
                name_product: req.body.name_product,
                //oldPrice_product: req.body.oldPrice_product,
                price_product: req.body.price_product,
                //image: req.files,
                image: req.files.map((file) => file.path),
                sizes: newSizeProduct,
                //quantity: req.body.quantity,
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
            if (req.file || req.files) {
                cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(500).json({ error: error.message });
        }
    },
    //[PUT] /api/product/edit/:_id
    updateProduct: async (req, res, next) => {
        try {
            const sizes = JSON.parse(req.body.sizes);
            //console.log(sizes);
            const updatedProductData = {
                name_product: req.body.name_product,
                //oldPrice_product: req.body.oldPrice_product,
                price_product: req.body.price_product,
                //size: req.body.size,
                //image: req.file.path,
                //quantity: req.body.quantity,
                describe: req.body.describe,
                detail: req.body.detail,
            };
            if (req.file) {
                updatedCategoryData.image = req.file.path;
            }
            updatedProductData.sizes = sizes;
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
    // api/search
    searchProduct: async (req, res, next) => {
        try {
            const search = req.body.search;
            const product_data = await ProductModel.find({
                name_product: { $regex: '.*' + search + '.*', $options: 'i' },
            });
            if (product_data.length > 0) {
                res.status(200).json({
                    sucess: true,
                    msg: 'Products details',
                    data: product_data,
                });
            } else {
                res.status(200).json({
                    sucess: true,
                    msg: 'Products not found!',
                });
            }
        } catch (error) {
            res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },

    // checkStock: async (req, res) => {
    //     try {
    //         const productId = req.body.id_product;
    //         const size = req.body.size;
    //         const quantity = req.body.quantity;
    //         //console.log(productId, size, quantity);
    //         const findProduct = await ProductModel.findById(productId);
    //         if (!findProduct) {
    //             return res.status(404).json({
    //                 sucess: false,
    //                 message: `The product with ID ${productId} not found!`,
    //             });
    //             const sizeObject = findProduct.sizes.find((s) => s.size === size);
    //         }
    //         if (!sizeObject) {
    //             return res.status(400).json({
    //                 sucess: false,
    //                 message: `Size ${size} not available for product with ID ${productId}`,
    //             });
    //         }
    //         const availableQuantity = sizeObject.quantity;
    //         if (quantity > availableQuantity) {
    //             return res.status(400).json({
    //                 sucess: false,
    //                 message: `Not enough stock for product with ID ${productId} and size ${size}`,
    //             });
    //         }
    //         return res.status(200).json({
    //             sucess: true,
    //             message: `Stock is available for product with ID ${productId} and size ${size}`,
    //         });
    //     } catch (error) {
    //         res.status(500).json({
    //             sucess: false,
    //             message: error.message,
    //         });
    //     }
    // },
    checkStock: async (productId, size, quantity, orderProduct) => {
        const findProduct = await ProductModel.findOne({ _id: productId });
        if (!findProduct) {
            return {
                sucess: false,
                status: 404,
                message: `The product with ID ${productId} not found!`,
            };
        }

        const sizeObject = findProduct.sizes.find((s) => s.size === size);

        if (!sizeObject) {
            return {
                sucess: false,
                status: 400,
                message: `Size ${size} not available for product with ID ${productId}`,
            };
        }

        const availableQuantity = sizeObject.quantity;

        if (quantity > availableQuantity) {
            return {
                sucess: false,
                status: 400,
                message: `Not enough stock for product with ID ${productId} and size ${size}`,
            };
        }

        return {
            sucess: true,
            status: 200,
            message: `Stock is available for product with ID ${productId} size ${size}`,
            data: orderProduct,
        };
    },
};

//console.log('checkstock', productController.checkStock('65119c48fc7f41f92911db94', '11', 10));

module.exports = productController;
