const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AlertSchema = new Schema({
    title: {
        type: String,
    },
    message: {
        type: String,
    },
    id_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    createAt: {
        type: Date,
        default: Date.now,
    },
    read: {
        type: Boolean,
        default: false,
    },
});

const AlertModel = mongoose.model('alert', AlertSchema);
module.exports = AlertModel;
