const moment = require('moment');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema(
    {
        id_product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
        },
        id_user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            require: true,
        },
        content: {
            type: String,
            require: true,
        },
        timestamp: {
            type: Date,
            default: Date.now(),
        },
    },
    {
        collection: 'comments',
    },
);

const CommentModel = mongoose.model('comments', CommentSchema);
module.exports = CommentModel;
