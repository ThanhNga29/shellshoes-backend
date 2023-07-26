const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    category: {
        type: String,
        require: true,
    },
    image: [],
});

const CategoryModel = mongoose.model('category', CategorySchema);
module.exports = CategoryModel;
