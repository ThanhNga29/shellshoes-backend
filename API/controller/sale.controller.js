const moment = require('moment');
const SaleModel = require('../../models/sale.model');
const ProductModel = require('../../models/product.model');

const SaleController = {
    createSale: async (req, res, next) => {
        try {
            const startSale = moment.utc(req.body.startSale, 'DD-MM-YYYY HH:mm').toDate();
            const endSale = moment.utc(req.body.endSale, 'DD-MM-YYYY HH:mm').toDate();
            const data = req.body;
            //console.log(data);
            const saleProduct = data.saleProducts.map((product) => ({
                salePrice: product.price - (product.price * product.promotion) / 100,
                promotion: product.promotion,
                id_product: product.id_product,
                //id_sale: product.id_product,
            }));

            //console.log(salePrice);
            const newSale = await new SaleModel({
                saleProducts: saleProduct,
                startSale: startSale,
                endSale: endSale,
            });
            const saveSale = await newSale.save();
            res.status(200).json({
                sucess: true,
                data: saveSale,
            });
        } catch (error) {
            res.status(500).json({
                sucess: false,
                error: error.message,
            });
        }
    },
    updateSale: async (req, res, next) => {
        try {
            const saleID = req.params._id;
            if (!saleID) {
                return res.status(404).json({
                    sucess: false,
                    message: 'The ID sale not found!',
                });
            }
            const updatedData = req.body;
            const now = new Date();
            const checkUpdatedSale = moment(now).isBetween(
                moment(updatedData.startSale),
                moment(updatedData.endSale),
            );
            if (checkUpdatedSale) {
                return res.status(400).json({
                    sucess: false,
                    message:
                        'This discount is in time, please delete if you want remove the discount!',
                });
            }
            updatedData.startSale = moment.utc(updatedData.startSale, 'DD-MM-YYYY HH:mm').toDate();
            updatedData.endSale = moment.utc(updatedData.endSale, 'DD-MM-YYYY HH:mm').toDate();
            updatedData.saleProducts = updatedData.saleProducts.map((product) => ({
                salePrice: product.price - (product.price * product.promotion) / 100,
                promotion: product.promotion,
                id_product: product.id_product,
            }));
            const updateSale = await SaleModel.findByIdAndUpdate(saleID, updatedData, {
                new: true,
            });
        } catch (error) {
            return res.status.json({
                sucess: false,
                message: error.message,
            });
        }
    },
    deleteSale: async (req, res, next) => {
        try {
            const deleteSale = await SaleModel.findByIdAndRemove(req.params._id);
            if (deleteSale) {
                return res.status(200).json({
                    sucess: true,
                    message: 'Sale is deleted!',
                });
            } else {
                return res.status(404).json({
                    sucess: false,
                    message: 'Sale not found!',
                });
            }
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    checkProductSaleCart: async (detail_cart) => {
        try {
            console.log('detail_cart:', detail_cart);
            const currentDate = new Date();
            const findProductSale = await SaleModel.find();
            const checkProductSaleInTime = await SaleModel.find({
                startSale: { $lte: currentDate },
                endSale: { $gte: currentDate },
            });
            console.log('checkProductSaleInTime:', checkProductSaleInTime);
            const cartWithSaleInfo = detail_cart.map((item) => {
                const product = item.id_product;
                //console.log('product:', product);
                const matchingSale = checkProductSaleInTime.find((sale) => {
                    return sale.saleProducts.some((saleProduct) =>
                        saleProduct.id_product.equals(product),
                    );
                });
                return {
                    ...item.toObject(),
                    matchingSale: matchingSale || null,
                };
            });
            return cartWithSaleInfo;
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    checkSaleProduct: async (data) => {
        try {
            console.log('data:', data);
            const currentDate = new Date();
            const findProduct = await ProductModel.find();
            const checkProductSaleInTime = await SaleModel.find({
                startSale: { $lte: currentDate },
                endSale: { $gte: currentDate },
            });
            console.log('checkProduct:', checkProductSaleInTime);
            const productWithSaleInfo = data.map((item) => {
                const id_product = item._id;
                const matchingSale = checkProductSaleInTime.find((sale) => {
                    return sale.saleProducts.some((saleProduct) =>
                        saleProduct.id_product.equals(id_product),
                    );
                });
                return {
                    ...item.toObject(),
                    matchingSale: matchingSale,
                };
            });
            return productWithSaleInfo;
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
};

module.exports = SaleController;
