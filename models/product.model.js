const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const category = require('./category.model');

const ProductSchema = new Schema({
    name_product: {
        type: String,
    },
    price_product: {
        type: String,
    },
    image: {
        type: String,
    },
    describe: {
        type: String,
    },
    id_category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
    },
});

const ProductModel = mongoose.model('product', ProductSchema);
module.exports = ProductModel;
