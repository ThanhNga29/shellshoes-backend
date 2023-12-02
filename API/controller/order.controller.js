const moment = require('moment');
const OrderModel = require('../../models/order.model');
const DetailOrderModel = require('../../models/detail-order.model');
const CartModel = require('../../models/cart.model');
const AccountModel = require('../../models/user.model');
const ProductModel = require('../../models/product.model');
const NoteModel = require('../../models/note.model');
const PaymentModel = require('../../models/payment.model');
const SaleModel = require('../../models/sale.model');
const { checkStock } = require('./product.controller');
//const { allProduct } = require('./product.controller');
//const processAllProductResult = require('../../middleware/checkSale');
const allProduct = require('../../middleware/checkSale');
const OrderController = {
    getOrderByUser: async (req, res, next) => {
        try {
            const userId = req.user.userId;
            const orderList = await OrderModel.find({ id_user: userId })
                .populate({
                    path: 'orderProducts',
                    populate: {
                        path: 'id_product',
                        select: 'name_product image',
                    },
                })
                .populate({
                    path: 'id_note',
                })
                .sort({ dateOrder: -1 });
            if (!orderList) {
                res.status(500).send('Cannot get order');
            }
            const formattedOrderList = orderList.map((order) => {
                return {
                    ...order._doc,
                    dateOrder: moment(order.dateOrder).format('DD/MM/YYYY HH:mm'),
                };
            });
            res.status(200).json({
                sucess: true,
                data: formattedOrderList,
            });
        } catch (error) {
            res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    createOrderProduct: async (req, res, next) => {
        try {
            const userId = req.user.userId;
            const cart = await CartModel.findOne({ id_user: userId });
            if (!cart) {
                return res.status(404).json({
                    sucess: false,
                    message: 'The cart not found!',
                });
            }
            const newNoteData = {
                fullname: req.body.fullname,
                phone: req.body.phone,
            };
            const newNote = await NoteModel.create(newNoteData);
            const newPayMent = {
                payName: req.body.payName,
            };
            const newPay = await PaymentModel.create(newPayMent);
            const orderProducts = req.body.orderProducts.map((item) => ({
                quantity: item.quantity,
                size: item.size,
                id_product: item.id_product,
                unit_price: item.unit_price,
                price: item.price,
            }));
            //console.log('orderProducts:', orderProducts);
            //const checkSale = await allProduct();
            const resultCheckStock = [];
            for (const orderProduct of orderProducts) {
                const productId = orderProduct.id_product;
                const size = orderProduct.size;
                const quantity = orderProduct.quantity;
                const productCheckStock = await checkStock(productId, size, quantity, orderProduct);

                resultCheckStock.push(productCheckStock);
            }
            const { sufficientArray, inSufficientArray } = resultCheckStock.reduce(
                (acc, current) => {
                    if (current.sucess === true) {
                        acc.sufficientArray.push(current);
                    } else {
                        acc.inSufficientArray.push(current);
                    }
                    return acc;
                },
                { sufficientArray: [], inSufficientArray: [] },
            );
            // console.log('sufficientArray', sufficientArray);
            // console.log('Insufficient', inSufficientArray);
            if (inSufficientArray.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Some products are out of stock',
                    data: inSufficientArray.map((m) => m.message),
                });
            }
            const checkSale = await allProduct();
            //console.log('checkSale:', checkSale);
            const resultCheckSaleProduct = [];
            let canProceedToOrder = true;

            for (const orderProduct of orderProducts) {
                const checkSaleProduct = checkSale.find(
                    (saleProduct) =>
                        saleProduct._id.toString() === orderProduct.id_product.toString(),
                );
                //console.log('checkSaleProduct:', checkSaleProduct);
                //console.log('checkSaleProduct:', checkSaleProduct);
                let messageQuantitySaleProduct = '';
                if (checkSaleProduct) {
                    const totalQuantityToPurchase =
                        orderProduct.quantity + checkSaleProduct.soldQuantity;
                    console.log('totalQuantityToPurchase:', totalQuantityToPurchase);
                    if (totalQuantityToPurchase > checkSaleProduct.limit) {
                        messageQuantitySaleProduct = `Exceeds the limit for product with ID ${orderProduct.id_product}`;
                        canProceedToOrder = false;
                    }
                }

                if (!canProceedToOrder) {
                    return res.json({ message: messageQuantitySaleProduct });
                }
                let eligibilityMessage = '';
                //let canProceedToOrder = '';

                if (
                    checkSaleProduct.salePrice !== null &&
                    orderProduct.unit_price === checkSaleProduct.salePrice
                ) {
                    eligibilityMessage = `The product condition 1 with ${orderProduct} eligible`;
                } else if (
                    checkSaleProduct.salePrice === null &&
                    orderProduct.unit_price === checkSaleProduct.price_product
                ) {
                    eligibilityMessage = `The product condition 2 with ${orderProduct} eligible`;
                } else {
                    eligibilityMessage = `The product with ID ${orderProduct.id_product} is not eligible`;
                    canProceedToOrder = false;
                }
                resultCheckSaleProduct.push(eligibilityMessage);

                //console.log(resultCheckSaleProduct);
                if (!canProceedToOrder) {
                    for (const result of resultCheckSaleProduct) {
                        if (result.includes('not eligible')) {
                            return res.json({ message: result });
                        }
                    }
                }
            }
            // console.log('resultCheckSaleProduct:', resultCheckSaleProduct);
            // console.log('canProcess:', canProceedToOrder);
            // if (!canProceedToOrder) {
            //     for (const result of resultCheckSaleProduct) {
            //         if (result.includes('not eligible')) {
            //             return res.json({ message: result });
            //         }
            //     }
            // }
            for (const orderProduct of orderProducts) {
                const updateCheckSaleProduct = checkSale.find(
                    (saleProduct) =>
                        saleProduct._id.toString() === orderProduct.id_product.toString(),
                );
                //console.log('updateCheckSaleProduct:', updateCheckSaleProduct);
                if (updateCheckSaleProduct) {
                    const updatedSoldQuantity =
                        updateCheckSaleProduct.soldQuantity + orderProduct.quantity;
                    //console.log('updatedSoldQuantity:', updatedSoldQuantity);
                    const saleToUpdate = await SaleModel.findOneAndUpdate(
                        { 'saleProducts.id_product': orderProduct.id_product.toString() },
                        {
                            $set: {
                                'saleProducts.$.soldQuantity': updatedSoldQuantity,
                            },
                        },
                        { new: true },
                    );
                }
            }
            for (const product of sufficientArray) {
                const productId = product.data.id_product;
                const size = product.data.size;
                const quantityToSubtract = product.data.quantity;
                const updateQuantity = await ProductModel.findOneAndUpdate(
                    {
                        _id: productId,
                        'sizes.size': size,
                    },
                    {
                        $inc: { 'sizes.$.quantity': -quantityToSubtract },
                    },
                    { new: true },
                );
            }
            //console.log('inSufficient', inSufficientArray);
            const newDetailOrder = await DetailOrderModel.create(
                sufficientArray.map((product) => ({
                    quantity: product.data.quantity,
                    size: product.data.size,
                    id_product: product.data.id_product,
                    unit_price: product.data.unit_price,
                    price: product.data.price,
                })),
            );
            //console.log('newdetail', newDetailOrder);
            const newTotalPrice = newDetailOrder.reduce((total, item) => total + item.price, 0);
            //console.log(newTotalPrice);
            const order = new OrderModel({
                id_user: userId,
                address: req.body.adress,
                status: 'Pending',
                orderProducts: newDetailOrder.map((orderItem) => orderItem._id),
                totalPrice: newTotalPrice,
                adress: req.body.address,
                id_note: newNote._id,
                id_payment: newPay._id,
            });
            const savedOrder = await order.save();
            const formattedTimestamp = moment().format('DD/MM/YYYY HH:mm');

            return res.status(200).json({
                success: true,
                message: 'Order created successfully!',
                data: { ...savedOrder._doc, dateOrder: formattedTimestamp },
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    // api/order/delete/:_id
    deleteOrder: async (req, res, next) => {
        try {
            const idOrder = req.params._id;
            //const deleteOrder = await OrderModel.findByIdAndRemove(idOrder);
            const deleteOrder = await OrderModel.findOne({ _id: idOrder });
            if (!deleteOrder) {
                return res.status(404).json({
                    sucess: false,
                    message: 'The order not found!',
                });
            }
            if (deleteOrder.status !== 'Pending') {
                return res.status(400).json({
                    sucess: false,
                    message: 'Can not delete order!',
                });
            }
            const productIds = deleteOrder.orderProducts.map((orderProduct) => orderProduct);
            //console.log(productIds);
            const products = await DetailOrderModel.find({ _id: { $in: productIds } });
            //console.log('product:', products);
            for (const product of products) {
                //console.log('product:', product);
                const findProduct = await ProductModel.findOne({ _id: product.id_product });
                //console.log('findProduct:', findProduct);
                if (findProduct) {
                    const sizeToUpdate = findProduct.sizes.find(
                        (size) => size.size === product.size,
                    );
                    if (sizeToUpdate) {
                        sizeToUpdate.quantity += product.quantity;
                    }
                    const updateProduct = await findProduct.save();
                }
            }
            const deleteDetailOrder = await DetailOrderModel.deleteMany({
                _id: { $in: productIds },
            });
            if (deleteOrder.id_note) {
                await NoteModel.findByIdAndDelete(deleteOrder.id_note);
            }
            if (deleteOrder.id_payment) {
                await PaymentModel.findByIdAndDelete(deleteOrder.id_payment);
            }
            const deleteMainOrder = await OrderModel.deleteOne({ _id: idOrder });

            return res.status(200).json({
                sucess: true,
                message: 'The order is deleted!',
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    // api/order/edit/:_id
    updateOrder: async (req, res, next) => {
        try {
            const updateOrder = await OrderModel.findByIdAndUpdate(
                req.params._id,
                {
                    status: req.body.status,
                },
                {
                    new: true,
                },
            );
            if (!updateOrder) {
                return res.status(500).json({
                    sucess: false,
                    message: 'Order can not update!',
                });
            }
            res.status(200).json({
                sucess: true,
                data: updateOrder,
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    getAllOrder: async (req, res, next) => {
        try {
            const allOrder = await OrderModel.find()
                .populate({
                    path: 'orderProducts',
                    populate: {
                        path: 'id_product',
                        select: 'name_product image',
                        populate: {
                            path: 'id_category',
                            select: 'category',
                        },
                    },
                })
                .populate({
                    path: 'id_note',
                })
                .sort({ dateOrder: -1 });
            const formattedAllOrder = allOrder.map((order) => {
                return {
                    ...order._doc,
                    dateOrder: moment(order.dateOrder).format('DD/MM/YYYY HH:mm'),
                };
            });
            return res.status(200).json({
                sucess: true,
                data: formattedAllOrder,
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    // api/order/detail/:_id
    detailOrder: async (req, res, next) => {
        try {
            const idOrder = req.params._id;
            //console.log(idOrder);
            const findDetail = await OrderModel.find({ _id: idOrder })
                .populate({
                    path: 'orderProducts',
                    populate: {
                        path: 'id_product',
                        select: 'name_product image',
                    },
                })
                .populate({
                    path: 'id_note',
                })
                .populate({
                    path: 'id_payment',
                })
                .exec();
            //console.log(findDetail);
            const format = findDetail.map((detailOrder) => {
                return {
                    ...detailOrder._doc,
                    dateOrder: moment(detailOrder.dateOrder).format('DD/MM/YYYY HH:mm'),
                };
            });
            //const formattedTimestamp = moment(findDetail.dateOrder).format('DD/MM/YYYY HH:mm');
            if (!findDetail) {
                return res.status(404).json({
                    sucess: false,
                    message: 'The order not found!',
                });
            }
            return res.status(200).json({
                sucess: true,
                // data: {
                //     ...findDetail._doc, // Convert Mongoose document to plain object
                //     dateOrder: moment(findDetail.dateOrder).format('DD/MM/YYYY HH:mm'),
                // },
                data: format,
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
};

module.exports = OrderController;
