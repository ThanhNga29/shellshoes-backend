const momentTimeZone = require('moment-timezone');
const moment = require('moment');
const ProductModel = require('../models/product.model');
const SaleModel = require('../models/sale.model');

const allProduct = async (req, res, next) => {
    try {
        const products = await ProductModel.find().populate({
            path: 'id_category',
        });
        const currentDate = moment();
        const checkProductSaleInTime = await SaleModel.find();
        const currentSales = checkProductSaleInTime.filter((product) => {
            const startSale = moment(product.startSale).tz('Asia/Bangkok');
            const endSale = moment(product.endSale).tz('Asia/Bangkok');
            return currentDate.isBetween(startSale, endSale);
        });

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
                product.soldQuantity = saleProduct.soldQuantity;
                product.limit = saleProduct.limit;
            }
        });
        return productsWithSaleInfo;
    } catch (error) {
        return { message: error.message };
    }
};
module.exports = allProduct;
