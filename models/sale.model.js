const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SaleSchema = new Schema({
    saleProducts: [
        {
            id_product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
            },
            promotion: {
                type: Number,
                require: true,
            },
            salePrice: {
                type: Number,
            },
            limit: {
                type: Number,
            },
            soldQuantity: {
                type: Number,
                default: 0,
            },
        },
    ],
    startSale: {
        type: Date,
    },
    endSale: {
        type: Date,
    },
    // status: {
    //     type: String,
    //     enum: ['upcoming', 'active', 'completed'],
    //     default: 'upcoming',
    // },
});

const SaleModel = mongoose.model('sale', SaleSchema);
module.exports = SaleModel;
