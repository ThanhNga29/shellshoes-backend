const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const category = require('./category.model');

const SizeProductSchema = new Schema({
    size: {
        type: Number,
        required: [true, 'Please include the size'],
    },
    quantity: {
        type: Number,
        required: [true, 'Please include the quantity for this size'],
    },
});

const ProductSchema = new Schema({
    name_product: {
        type: String,
        required: [true, 'Please include the product name'],
    },
    // oldPrice_product: {
    //     type: Number,
    //     required: [true, 'Please include te product Price'],
    // },
    price_product: {
        type: Number,
    },
    sizes: [SizeProductSchema],
    image: {
        type: Array,
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
    salePrice: {
        type: Number,
        default: null,
    },
});

const ProductModel = mongoose.model('product', ProductSchema);
module.exports = ProductModel;
