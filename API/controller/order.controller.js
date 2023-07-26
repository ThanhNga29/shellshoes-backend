const OrderModel = require('../../models/order.model');
const DetailOrderModel = require('../../models/detail-order.model');
const { Promise } = require('mongoose');

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
    // createOrderProduct: async (req, res) => {
    //     try {
    //         const orderProductIds = Promise.all(
    //             _id.map(async (detailOrder) => {
    //                 const newDetailOrderProduct = new DetailOrderModel({
    //                     quantity: detailOrder.quantity,
    //                     size: detailOrder.size,
    //                     id_product: detailOrder.id_product,
    //                 });
    //                 newDetailOrderProduct = await newDetailOrderProduct.save();
    //                 return newDetailOrderProduct._id;
    //             }),
    //         );
    //         res.status(200).json(orderProductIds);
    //     } catch (error) {
    //         res.status(500).json({
    //             message: error.message,
    //         });
    //     }
    // },

    // createOrderProduct: async (req, res) => {
    //     try {
    //         const id_order = req.body.id_order;
    //         if (!Array.isArray(id_order)) {
    //             throw new Error('Invalid or missing id_order.');
    //         }

    // Tạo đơn hàng chính (Order) trước
    // const newOrder = new OrderModel({
    //     adress: req.body.adress, // Ghi chú: kiểm tra xem dữ liệu yêu cầu có trường "adress" hay không
    //     totalPrice: req.body.totalPrice, // Ghi chú: kiểm tra xem dữ liệu yêu cầu có trường "totalPrice" hay không
    //     status: 'pending', // Trạng thái đơn hàng mặc định là "pending"
    //     id_user: req.body.id_user, // Ghi chú: kiểm tra xem dữ liệu yêu cầu có trường "id_user" hay không
    //     id_note: req.body.id_note, // Ghi chú: kiểm tra xem dữ liệu yêu cầu có trường "id_note" hay không
    //     id_payment: req.body.id_payment, // Ghi chú: kiểm tra xem dữ liệu yêu cầu có trường "id_payment" hay không
    // });
    //const savedOrder = await newOrder.save();

    // Tạo danh sách các đơn hàng chi tiết (DetailOrder) liên kết với đơn hàng chính (Order)
    //         const orderProductIds = await Promise.all(
    //             id_order.map(async (detail_order) => {
    //                 const newDetailOrderProduct = new DetailOrderModel({
    //                     quantity: detailOrder.quantity,
    //                     size: detailOrder.size,
    //                     id_product: detailOrder.id_product,
    //                     //id_order: savedOrder._id, // Liên kết với đơn hàng chính đã được tạo
    //                 });
    //                 const savedDetailOrder = await newDetailOrderProduct.save();
    //                 return savedDetailOrder._id;
    //             }),
    //         );

    //         res.status(200).json(orderProductIds);
    //         const newOrder = new OrderModel({
    //             adress: req.body.adress, // Ghi chú: kiểm tra xem dữ liệu yêu cầu có trường "adress" hay không
    //             totalPrice: req.body.totalPrice, // Ghi chú: kiểm tra xem dữ liệu yêu cầu có trường "totalPrice" hay không
    //             status: 'pending', // Trạng thái đơn hàng mặc định là "pending"
    //             id_user: req.body.id_user, // Ghi chú: kiểm tra xem dữ liệu yêu cầu có trường "id_user" hay không
    //             id_note: req.body.id_note, // Ghi chú: kiểm tra xem dữ liệu yêu cầu có trường "id_note" hay không
    //             id_payment: req.body.id_payment, // Ghi chú: kiểm tra xem dữ liệu yêu cầu có trường "id_payment" hay không
    //         });
    //     } catch (error) {
    //         res.status(500).json({
    //             message: error.message,
    //         });
    //     }
    // },
    createOrderProduct: async (req, res) => {
        try {
            const order = await OrderModel.create();
            res.json(order);
            const orderProductIds = Promise.all(
                _id.map(async (detailOrder) => {
                    const newDetailOrderProduct = new DetailOrderModel({
                        quantity: detailOrder.quantity,
                        size: detailOrder.size,
                        id_product: detailOrder.id_product,
                    });
                    newDetailOrderProduct = await newDetailOrderProduct.save();
                    return newDetailOrderProduct._id;
                }),
            );
            res.status(200).json(orderProductIds);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
};

module.exports = OrderController;
