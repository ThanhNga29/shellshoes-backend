const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    adress: {
        type: String,
    },
    totalPrice: {
        type: Number,
    },
    status: {
        type: String,
    },
    dateOrder: {
        type: Date,
        default: Date.now,
    },
    id_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    id_note: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'note',
    },
    id_payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'payment',
    },
});

const OrderModel = mongoose.model('order', OrderSchema);
module.exports = OrderModel;
