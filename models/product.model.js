const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const category = require('./category.model');

const ProductSchema = new Schema({
    name_product: {
        type: String,
    },
    oldPrice_product: {
        type: Number,
    },
    newPrice_Product: {
        type: Number,
    },
    size: {
        type: [],
    },
    image: {
        type: String,
    },
    quantity: {
        type: Number,
    },
    describe: {
        type: String,
    },
    detail: {
        type: String,
    },
    id_category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
    },
});

const ProductModel = mongoose.model('product', ProductSchema);
module.exports = ProductModel;
