const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NoteSchema = new Schema({
    fullname: {
        type: String,
        require: true,
    },
    phone: {
        type: Number,
        require: true,
    },
});

const NoteModel = mongoose.model('note', NoteSchema);
module.exports = NoteModel;
