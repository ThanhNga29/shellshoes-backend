const moment = require('moment');
const OrderModel = require('../../models/order.model');
const UserModel = require('../../models/user.model');
const DetailOrder = require('../../models/detail-order.model');
const statisticalController = {
    monthlyRevenue: async (req, res, next) => {
        try {
            const findRevenue = await OrderModel.find();
            const revenueByMonth = {};
            findRevenue.forEach((total) => {
                const { totalPrice, dateOrder } = total;
                const yearMonth = moment(dateOrder).format('YYYY-MM');
                revenueByMonth[yearMonth] = (revenueByMonth[yearMonth] || 0) + totalPrice;
            });
            return res.status(200).json({
                sucess: true,
                data: revenueByMonth,
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    requestRevenue: async (req, res, next) => {
        try {
            const findRevenue = await OrderModel.find();
            const startRequest = moment(req.body.startRequest, 'DD-MM-YYYY').startOf('day');
            const endRequest = moment(req.body.endRequest, 'DD-MM-YYYY').endOf('day');

            const dailyRevenue = {};

            findRevenue.forEach((order) => {
                const dateOrder = moment(order.dateOrder).format('YYYY-MM-DD');
                const check = moment(order.dateOrder).isBetween(startRequest, endRequest);
                //console.log(check);
                if (check) {
                    dailyRevenue[dateOrder] = (dailyRevenue[dateOrder] || 0) + order.totalPrice;
                }
            });
            return res.status(200).json({
                sucess: true,
                data: dailyRevenue,
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    totalRevenue: async (req, res, next) => {
        try {
            const findOrder = await OrderModel.find();
            const result = findOrder.reduce((total, item) => total + item.totalPrice, 0);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    orderNumber: async (req, res, next) => {
        try {
            const findOrder = await OrderModel.find();
            const orderNumber = findOrder.length;
            return res.status(200).json(orderNumber);
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    userNumber: async (req, res, next) => {
        try {
            const findUser = await UserModel.find();
            const userNumber = findUser.length;
            return res.status(200).json(userNumber);
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    monthlyUser: async (req, res, next) => {
        try {
            const findUser = await UserModel.find();
            const userByMonth = {};
            findUser.forEach((total) => {
                if (total.isAdmin === false) {
                    const { createdAt } = total;
                    const userMonth = moment(createdAt).format('YYYY-MM');
                    userByMonth[userMonth] = (userByMonth[userMonth] || 0) + 1;
                }
            });
            return res.status(200).json({
                sucess: true,
                data: userByMonth,
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    sellNumber: async (req, res, next) => {
        try {
            const findSell = await OrderModel.find().populate({
                path: 'orderProducts',
            });
            let totalQuantity = 0;
            findSell.forEach((orders) => {
                orders.orderProducts.forEach((order) => {
                    totalQuantity += order.quantity;
                });
                return totalQuantity;
            });
            // const totalQuantity = findSell.reduce((total, order) => {
            //     const orderQuantity = order.orderProducts.reduce(
            //         (subtotal, product) => subtotal + product.quantity,
            //         0,
            //     );
            //     return total + orderQuantity;
            // }, 0);
            return res.status(200).json({
                sucess: true,
                data: totalQuantity,
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    topTenHighestRevenueProducts: async (req, res, next) => {
        try {
            const findOrderProduct = await OrderModel.find()
                .populate({
                    path: 'orderProducts',
                    select: 'id_product price',
                    populate: {
                        path: 'id_product',
                        select: 'name_product',
                    },
                })
                .select('orderProducts')
                .exec();
            const sumPricePorduct = findOrderProduct.reduce((result, order) => {
                order.orderProducts.forEach((product) => {
                    const { _id, name_product } = product.id_product;
                    const existingProduct = result.find((item) => item.id_product._id === _id);
                    if (!existingProduct) {
                        result.push({
                            id_product: _id,
                            name_product: name_product,
                            sumPrice: product.price,
                        });
                    } else {
                        existingProduct.sumPrice += product.price;
                    }
                });

                return result;
            }, []);
            return res.status(200).json({
                sucess: true,
                data: sumPricePorduct,
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
};
module.exports = statisticalController;
