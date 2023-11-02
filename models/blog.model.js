const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
    title: {
        type: String,
    },
    body: {
        type: String,
    },
    image: [],
    id_product: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
        },
    ],
    createAt: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
});

const BlogModel = mongoose.model('blog', BlogSchema);
module.exports = BlogModel;
