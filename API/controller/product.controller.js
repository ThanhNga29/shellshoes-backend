const momentTimeZone = require('moment-timezone');
const moment = require('moment');
const ProductModel = require('../../models/product.model');
const SaleModel = require('../../models/sale.model');
const CategoryModel = require('../../models/category.model');
const cloudinary = require('cloudinary').v2;
// const { checkSaleProduct, checkSaleOneProduct } = require('./sale.controller');
// const { checkSaleProduct1 } = require('./sale.controller');
const { checkSaleOneProduct, checkSaleProduct } = require('./sale.controller');
const { detailProductSale } = require('./sale.controller');
const { getCurrentSaleProduct } = require('./sale.controller');
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
    allProduct: async (req, res, next) => {
        try {
            const products = await ProductModel.find().populate({
                path: 'id_category',
            });
            const currentDate = moment();
            //console.log(currentDate);
            const checkProductSaleInTime = await SaleModel.find();
            const currentSales = checkProductSaleInTime.filter((product) => {
                const startSale = moment(product.startSale).tz('Asia/Bangkok');
                //console.log('startSale:', startSale);
                const endSale = moment(product.endSale).tz('Asia/Bangkok');
                //console.log('endSale:', endSale);
                return currentDate.isBetween(startSale, endSale);
            });
            console.log(currentSales);
            const productsWithSaleInfo = JSON.parse(JSON.stringify(products));

            productsWithSaleInfo.forEach((product) => {
                const saleInfo = currentSales.find((sale) => {
                    const saleProduct = sale.saleProducts.find(
                        (sp) => sp.id_product.toString() === product._id.toString(),
                    );
                    return saleProduct !== undefined;
                });

                if (saleInfo) {
                    const saleProduct = saleInfo.saleProducts.find(
                        (sp) => sp.id_product.toString() === product._id.toString(),
                    );
                    product.salePrice = saleProduct.salePrice;
                }
            });
            res.json(productsWithSaleInfo);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    //[POST] /api/newproduct
    createNewproduct: async (req, res, next) => {
        try {
            //console.log(filedata);
            //console.log(req.body.sizes);
            const id_category = await CategoryModel.findOne({ category: req.body.category });
            //const size = req.body.sizes.map((size) => JSON.parse(size))
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
            const newSizeProduct = sizes.map((size) => ({
                size: size.size,
                quantity: size.quantity,
            }));
            console.log(newSizeProduct);
            //console.log(sizes);
            const updatedProductData = {
                name_product: req.body.name_product,
                //oldPrice_product: req.body.oldPrice_product,
                price_product: req.body.price_product,
                sizes: newSizeProduct,
                //size: req.body.size,
                //image: req.file.path,
                //quantity: req.body.quantity,
                category: req.body.category,
                describe: req.body.describe,
                detail: req.body.detail,
            };
            if (req.files) {
                updatedProductData.image = req.files.path;
            }
            //updatedProductData.sizes = sizes;
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
            const search = req.query.search;
            const product_data = await ProductModel.find({
                name_product: { $regex: '.*' + search + '.*', $options: 'i' },
            });
            if (product_data.length > 0) {
                return res.status(200).json({
                    sucess: true,
                    msg: 'Products details',
                    data: product_data,
                });
            } else {
                return res.status(200).json({
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
                message: `Not enough stock for product with ID ${productId} with size ${size}`,
            };
        }

        return {
            sucess: true,
            status: 200,
            message: `Stock is available for product with ID ${productId} size ${size}`,
            data: orderProduct,
        };
    },
    productHomePage: async (req, res, next) => {
        try {
            let perPage = 2;
            let page = req.params.page || 1;
            const products = await ProductModel.find()
                .skip(perPage * page - perPage)
                .limit(perPage)
                .exec();
            const count = await ProductModel.countDocuments();
            return res.status(200).json({
                sucess: true,
                data: { products, current: page, pages: Math.ceil(count / perPage) },
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    productPagination: async (req, res, next) => {
        try {
            let perPage = 2;
            let page = req.params.page;
            const products = await ProductModel.find()
                .skip(perPage * page - perPage)
                .limit(perPage)
                .exec();
            const count = await ProductModel.countDocuments();
            res.status(200).json({
                sucess: true,
                data: { products, current: page },
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    detailProduct: async (req, res, next) => {
        try {
            const idProduct = req.params._id;
            const findProduct = await ProductModel.findById(idProduct);
            if (!findProduct) {
                return res.status(404).json({
                    sucess: false,
                    message: 'The Product not found!',
                });
            }
            const checkProductIsInSale = await getCurrentSaleProduct(idProduct);
            const result = {
                product: findProduct,
                productIsInSale: checkProductIsInSale,
            };
            return res.status(200).json({
                sucess: true,
                data: result,
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
};

module.exports = productController;
