const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DetailOrderSchema = new Schema({
    quantity: {
        type: Number,
        default: true,
    },
    size: {
        type: String,
        default: true,
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
