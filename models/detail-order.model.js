const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DetailOrderSchema = new Schema({
    quantity: {
        type: Number,
        default: 0,
        required: true,
    },
    size: {
        type: String,
        default: '',
        required: true,
    },
    id_product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
    },
    id_order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order',
    },
});

const DetailOrderModel = mongoose.model('detail_order', DetailOrderSchema);
module.exports = DetailOrderModel;
