const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccountSchema = new Schema(
    {
        fullname: {
            type: String,
            min: 6,
            max: 20,
            unique: true,
            required: true,
        },
        numberphone: {
            type: String,
            unique: true,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            min: 6,
            max: 20,
            unique: false,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
    },
    {
        collection: 'users',
    },
);

const AccountModel = mongoose.model('users', AccountSchema);
module.exports = AccountModel;
