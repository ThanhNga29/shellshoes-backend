const OrderModel = require('../../models/order.model');
const DetailOrderModel = require('../../models/detail-order.model');
const CartModel = require('../../models/cart.model');
const AccountModel = require('../../models/user.model');
const ProductModel = require('../../models/product.model');
const NoteModel = require('../../models/note.model');
const PaymentModel = require('../../models/payment.model');

const OrderController = {
    orderList: async (req, res) => {
        try {
            const orderList = await OrderModel.find()
                .populate('user', 'fullname')
                .sort({ dateOrder: -1 });
            if (!orderList) {
                res.status(500).send('Cannot get order');
            }
            res.status(200).send(orderList);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    createOrderProduct: async (req, res, next) => {
        try {
            const userId = req.user.userId;
            const cart = await CartModel.findOne({ id_user: userId })
                .populate({
                    path: 'detail_cart.id_product',
                    select: 'name_product newPrice_product',
                })
                .exec();
            if (!cart) {
                return res.status(404).json({
                    sucess: false,
                    message: 'The cart not found!',
                });
            }
            const orderProducts = cart.detail_cart.map((item) => ({
                quantity: item.quantity,
                size: item.size,
                id_product: item.id_product,
            }));
            const newDetailOrder = new DetailOrderModel.create(orderProducts);
            const newTotalPrice = cart.detail_cart.reduce((total, item) => total + item.price, 0);
            const order = new OrderModel({
                id_user: userId,
                address: req.body.adress,
                status: 'Pending',
                orderProducts: newDetailOrder.map(),
            });
        } catch (error) {}
    },
};

module.exports = OrderController;
