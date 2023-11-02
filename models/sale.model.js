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
            // id_sale: {
            //     type: mongoose.Schema.Types.ObjectId,
            //     ref: 'sale',
            // },
        },
    ],
    startSale: {
        type: Date,
    },
    endSale: {
        type: Date,
    },
});

const SaleModel = mongoose.model('sale', SaleSchema);
module.exports = SaleModel;
