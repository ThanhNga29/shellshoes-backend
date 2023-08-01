const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    detail_cart: [
        {
            id_product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
            },
            quantity: {
                type: Number,
                required: true,
            },
            size: {
                type: Number,
                required: true,
            },
            unitPrice: {
                type: Number,
            },
            price: {
                type: Number,
            },
        },
    ],
    id_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
});

const CartModel = mongoose.model('cart', CartSchema);
module.exports = CartModel;
