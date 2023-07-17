const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
    payname: {
        type: String,
    },
});

const PaymentModel = mongoose.model('payment', PaymentSchema);
module.exports = PaymentModel;
