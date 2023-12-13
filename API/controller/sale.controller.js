const moment = require('moment');
const momentTimeZone = require('moment-timezone');
// moment.tz.setDefault('Asia/Bangkok');

const SaleModel = require('../../models/sale.model');
const ProductModel = require('../../models/product.model');

const SaleController = {
    createSale: async (req, res, next) => {
        try {
            const startSale = moment(req.body.startSale, 'DD-MM-YYYY HH:mm', 'Asia/Bangkok');
            const endSale = moment(req.body.endSale, 'DD-MM-YYYY HH:mm', 'Asia/Bangkok');
            const data = req.body;
            //console.log(data);
            const saleProduct = data.saleProducts.map((product) => ({
                salePrice: product.price - (product.price * product.promotion) / 100,
                promotion: product.promotion,
                id_product: product.id_product,
                limit: product.limit,
                //id_sale: product.id_product,
            }));
            const findProduct = await ProductModel.find();
            for (const checkLimit of data.saleProducts) {
                //console.log('checkLimit:', checkLimit);
                const checkLimitProduct = findProduct.find(
                    (product) => checkLimit.id_product.toString() === product._id.toString(),
                );
                //console.log('checkLimitProduct:', checkLimitProduct);
                const totalQuantity = checkLimitProduct.sizes.reduce(
                    (sum, size) => sum + size.quantity,
                    0,
                );
                // console.log('totalQuantity:', totalQuantity);
                // console.log('checkLimitKQ:', checkLimit.limit);
                if (checkLimit.limit > totalQuantity) {
                    return res.status(400).json({
                        sucess: false,
                        message: `Limit exceeds total quantity for product with ID ${checkLimit.id_product}`,
                    });
                }
            }
            //console.log('saleProducts:', saleProduct);
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
            const findSaleId = await SaleModel.findById({ _id: saleID });
            if (!findSaleId) {
                return res.status(404).json({
                    sucess: false,
                    message: 'The ID sale not found!',
                });
            }
            const now = moment();
            //console.log('now:', now);
            const startSale = moment(findSaleId.startSale).tz('Asia/Bangkok');
            console.log('startSale:', startSale);
            const endSale = moment(findSaleId.endSale).tz('Asia/Bangkok');
            console.log('endSale:', endSale);
            if (now.isBetween(startSale, endSale)) {
                return res.status(400).json({
                    sucess: false,
                    message:
                        'This discount is in time, please delete if you want remove the discount!',
                });
            }
            const updatedData = req.body;
            updatedData.startSale = moment.tz(
                updatedData.startSale,
                'DD-MM-YYYY HH:mm',
                'Asia/Bangkok',
            );
            updatedData.endSale = moment.tz(
                updatedData.endSale,
                'DD-MM-YYYY HH:mm',
                'Asia/Bangkok',
            );
            updatedData.saleProducts = updatedData.saleProducts.map((product) => ({
                salePrice: product.price - (product.price * product.promotion) / 100,
                promotion: product.promotion,
                id_product: product.id_product,
            }));
            const updateSale = await SaleModel.findByIdAndUpdate(saleID, updatedData, {
                new: true,
            });
            return res.status(200).json({
                message: 'Updated Sale sucessfully!',
                data: updateSale,
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
    checkSaleOneProduct: async (_id) => {
        //console.log('_id:', _id);
        const findProduct = await ProductModel.findById(_id);
        //console.log(findProduct);
        if (!findProduct) {
            return {
                sucess: false,
                status: 404,
                message: 'The product not found',
            };
        }
        const saleInfo = await SaleController.getCurrentSale(_id);
        //console.log('saleInfo:', saleInfo);
        if (saleInfo) {
            findProduct.salePrice = saleInfo.salePrice;
            return findProduct;
        } else {
            //console.log(456);
            findProduct.salePrice = null;
            return findProduct;
        }
    },

    getCurrentSale: async (productId) => {
        // try {
        const checkProductSaleInTime = await SaleModel.find();
        const currentDate = moment();
        //console.log(123);
        const currentSale = checkProductSaleInTime.filter((product) => {
            const startSale = moment(product.startSale).tz('Asia/Bangkok');
            const endSale = moment(product.endSale).tz('Asia/Bangkok');
            return currentDate.isBetween(startSale, endSale);
        });
        if (currentSale.length > 0) {
            const saleProduct = currentSale[0].saleProducts.find(
                (sp) => sp.id_product.toString() === productId.toString(),
            );
            return saleProduct;
        }
        return null;
    },
    getCurrentSaleProduct1: async (productId) => {
        // try {
        const checkProductSaleInTime = await SaleModel.find();
        console.log('checkProductSaleInTime:', checkProductSaleInTime);
        const currentDate = moment();
        //console.log(123);
        const currentSale = checkProductSaleInTime.filter((product) => {
            const startSale = moment(product.startSale).tz('Asia/Bangkok');
            const endSale = moment(product.endSale).tz('Asia/Bangkok');
            return currentDate.isBetween(startSale, endSale);
        });
        console.log('currentSale:', currentSale);
        if (currentSale.length > 0) {
            const saleProduct = currentSale.saleProducts.find(
                (sp) => sp.id_product.toString() === productId.toString(),
            );
            console.log('saleProduct:', saleProduct);
            if (saleProduct) {
                return {
                    startSale: moment(currentSale[0].startSale).tz('Asia/Bangkok').format(),
                    endSale: moment(currentSale[0].endSale).tz('Asia/Bangkok').format(),
                    saleProduct: saleProduct,
                };
            }
        }
        return null;
    },
    getCurrentSaleProduct: async (productId) => {
        try {
            const checkProductSaleInTime = await SaleModel.find();
            console.log('checkProductSaleInTime:', checkProductSaleInTime);
            const currentDate = moment();

            let matchingSaleProduct = null;

            checkProductSaleInTime.forEach((sale) => {
                const startSale = moment(sale.startSale).tz('Asia/Bangkok');
                const endSale = moment(sale.endSale).tz('Asia/Bangkok');

                if (currentDate.isBetween(startSale, endSale)) {
                    const saleProduct = sale.saleProducts.find(
                        (sp) => sp.id_product.toString() === productId.toString(),
                    );

                    if (saleProduct) {
                        matchingSaleProduct = {
                            startSale: startSale.format(),
                            endSale: endSale.format(),
                            saleProduct: saleProduct,
                        };
                    }
                }
            });

            // console.log('matchingSaleProduct:', matchingSaleProduct);
            return matchingSaleProduct;
        } catch (error) {
            console.error('Error in getCurrentSaleProduct:', error);
            return null;
        }
    },
    allSale: async (req, res, next) => {
        try {
            //moment.tz.setDefault('Asia/Bangkok');
            const findAllIdSale = await SaleModel.find().populate({
                path: 'saleProducts.id_product',
            });
            //console.log(findAllIdSale);
            const formattedSaleList = findAllIdSale.map((sale) => {
                const startSale = moment(sale.startSale)
                    .tz('Asia/Bangkok')
                    .format('DD-MM-YYYY HH:mm');
                //console.log('start:', startSale);
                const endSale = moment(sale.endSale).tz('Asia/Bangkok').format('DD-MM-YYYY HH:mm');
                //console.log('end:', endSale);
                return {
                    ...sale._doc,
                    startSale,
                    endSale,
                };
            });
            return res.status(200).json({
                sucess: true,
                data: formattedSaleList,
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    detailSaleProduct: async (req, res, next) => {
        try {
            const findIdSale = await SaleModel.findById(req.params._id)
                .populate({
                    path: 'saleProducts.id_product',
                })
                .exec();
            if (!findIdSale) {
                return res.status(404).json({
                    sucess: false,
                    message: 'The Sale not found!',
                });
            }
            //console.log(findIdSale);
            const startSale = moment(findIdSale.startSale)
                .tz('Asia/Bangkok')
                .format('DD-MM-YYYY HH:mm');
            //console.log(startSale);
            const endSale = moment(findIdSale.endSale)
                .tz('Asia/Bangkok')
                .format('DD-MM-YYYY HH:mm');
            return res.status(200).json({
                sucess: true,
                data: {
                    ...findIdSale._doc,
                    startSale,
                    endSale,
                },
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    saleCompleted: async (req, res, next) => {
        try {
            const findIdSale = await SaleModel.find();
            const currentDate = moment();
            //console.log(currentDate);
            const checkSaleCompleted = findIdSale.filter((sale) => {
                //const startSale = moment(sale.startSale).tz('Asia/Bangkok');
                const endSale = moment(sale.endSale).tz('Asia/Bangkok');
                return currentDate.isAfter(endSale);
            });
            if (checkSaleCompleted.length == 0) {
                return res.status(404).json({
                    sucess: false,
                    message: 'No completed sales found!',
                });
            }
            return res.status(200).json({
                sucess: true,
                data: checkSaleCompleted,
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    saleActive: async (req, res, next) => {
        try {
            const findIdSale = await SaleModel.find();
            const currentDate = moment();
            const checkSaleActive = findIdSale.filter((sale) => {
                const startSale = moment(sale.startSale).tz('Asia/Bangkok');
                const endSale = moment(sale.endSale).tz('Asia/Bangkok');
                return currentDate.isBetween(startSale, endSale);
            });
            if (checkSaleActive.length == 0) {
                return res.status(404).json({
                    return: false,
                    message: 'No active sales found!',
                });
            }
            return res.status(200).json({
                sucess: true,
                data: checkSaleActive,
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    saleUpcoming: async (req, res, next) => {
        try {
            const findIdSale = await SaleModel.find();
            const currentDate = moment();
            //console.log(currentDate);
            const checkSaleUpcoming = findIdSale.filter((sale) => {
                const startSale = moment(sale.startSale).tz('Asia/Bangkok');
                return currentDate.isBefore(startSale);
            });
            if (checkSaleUpcoming.length == 0) {
                return res.status(404).json({
                    sucess: false,
                    message: 'No upcoming sales found!',
                });
            }
            return res.status(200).json({
                sucess: true,
                data: checkSaleUpcoming,
            });
        } catch (error) {
            return res.status(500).json({
                sucess: true,
                message: error.message,
            });
        }
    },
    checkConflictProductSale: async (req, res, next) => {
        try {
            const startDate = moment(req.body.startSale, 'DD-MM-YYYY HH:mm').tz('Asia/Bangkok');
            const endDate = moment(req.body.endSale, 'DD-MM-YYYY HH:mm').tz('Asia/Bangkok');

            // Find all sales that overlap with the requested time range
            const overlappingSales = await SaleModel.find({
                $or: [
                    { startSale: { $lte: endDate }, endSale: { $gte: startDate } },
                    { startSale: { $gte: startDate, $lte: endDate } },
                ],
            }).populate({
                path: 'saleProducts.id_product',
            });
            //console.log('overlapping:', overlappingSales);
            const overlappingProductIds = overlappingSales.flatMap((sale) =>
                sale.saleProducts.map((product) => product.id_product.toString()),
            );
            //console.log('overlappingProductIds:', overlappingProductIds);
            // Find all products
            const allProducts = await ProductModel.find({});
            console.log('nonConflictProduct:', !overlappingProductIds);
            const nonProductsWithConflict = allProducts.filter(
                (product) => !overlappingProductIds.includes(product._id.toString()),
            );
            const nonProductsWithConflictFiltered = nonProductsWithConflict.filter(
                (product) =>
                    !overlappingSales.some((sale) =>
                        sale.saleProducts.some(
                            (saleProduct) =>
                                saleProduct.id_product._id.toString() === product._id.toString(),
                        ),
                    ),
            );
            //console.log('nonConmflict:', nonProductsWithConflict);
            //console.log('productsWithConflict:', nonProductsWithConflict);
            return res.status(200).json({
                sucess: true,
                data: {
                    productWithConflict: overlappingSales,
                    nonProductsWithConflict: nonProductsWithConflictFiltered,
                },
            });
            //res.json({ overlappingSales });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
};

module.exports = SaleController;
