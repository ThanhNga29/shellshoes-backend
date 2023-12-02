const moment = require('moment');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FavoriteSchema = new Schema(
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
    },
    {
        collection: 'favorites',
    },
);

const FavoriteModel = mongoose.model('favorites', FavoriteSchema);
module.exports = FavoriteModel;
