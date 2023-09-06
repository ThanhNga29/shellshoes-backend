const moment = require('moment');
const OrderModel = require('../../models/order.model');
const DetailOrderModel = require('../../models/detail-order.model');
const CartModel = require('../../models/cart.model');
const AccountModel = require('../../models/user.model');
const ProductModel = require('../../models/product.model');
const NoteModel = require('../../models/note.model');
const PaymentModel = require('../../models/payment.model');

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
            //console.log(req.body);
            const userId = req.user.userId;
            const quantity = req.body.quantity;
            const unit_price = req.body.unit_price;
            const price = req.body.price;
            const cart = await CartModel.findOne({ id_user: userId });
            // .populate({
            //     path: 'detail_cart.id_product',
            //     select: 'name_product newPrice_product',
            // })
            // .exec();
            //console.log(cart);
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
            // if (req.body..length() !== 10) {
            //     return res.status(400).json({
            //         sucess: false,
            //         message: 'Phone number must be 10 character!',
            //     });
            // }
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

            for (const orderProduct of orderProducts) {
                const product = await ProductModel.findById(orderProduct.id_product);
                if (!product) {
                    return res.status(404).json({
                        sucess: false,
                        message: 'The product with ID ${orderProduct.id_product} not found!',
                    });
                }
                if (product.quantity < orderProduct.quantity) {
                    return res.status(400).json({
                        sucess: false,
                        message: 'Not enough stock available!',
                    });
                }
                product.quantity -= orderProduct.quantity;
                await product.save();
            }

            const newDetailOrder = await DetailOrderModel.create(orderProducts);
            const newTotalPrice = orderProducts.reduce((total, item) => total + item.price, 0);
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
            res.status(500).json({
                sucess: false,
                msg: error.message,
            });
        }
    },
    // api/order/delete/:_id
    deleteOrder: async (req, res, next) => {
        try {
            const idOrder = req.params._id;
            //const deleteOrder = await OrderModel.findByIdAndRemove(idOrder);
            const deleteOrder = await OrderModel.findOne({ _id: idOrder });
            //     .populate({
            //     path: 'orderProducts._id'
            // });
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
            if (deleteOrder.id_note) {
                await NoteModel.findByIdAndDelete(deleteOrder.id_note);
            }
            for (const orderProduct of deleteOrder.orderProducts) {
                //console.log(orderProduct);
                const product = await DetailOrderModel.findOne({ _id: orderProduct._id });
                //console.log(product);
                const findProduct = await ProductModel.findOne({ _id: product.id_product });
                //console.log(findProduct);
                if (findProduct) {
                    //console.log(product.quantity);
                    findProduct.quantity += product.quantity;
                    await findProduct.save();
                    //console.log(findProduct);
                }
                await DetailOrderModel.findByIdAndDelete(orderProduct._id);
            }
            await deleteOrder.deleteOne({ _id: idOrder });

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
