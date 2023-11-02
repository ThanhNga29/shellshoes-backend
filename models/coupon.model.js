const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CouponSchema = new Schema({
    Code: {
        type: String,
    },
    Count: {
        type: Number,
    },
    Conditions: {
        type: String,
    },
    UsageLimit: {
        type: Number,
    },
    Status: {
        type: Boolean,
    },
    applicableProducts: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
    },
    startCoupon: {
        type: Date,
    },
    endCoupon: {
        type: Date,
    },
});

const CouponModel = mongoose.model('coupon', CouponSchema);
module.exports = CouponModel;
