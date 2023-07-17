const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    category: {
        type: String,
    },
    image: [],
});

const CategoryModel = mongoose.model('category', CategorySchema);
module.exports = CategoryModel;
