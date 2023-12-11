const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
        },
        content: {
            type: String,
        },
    },
    {
        timestamps: true,
    },
);
const DetailChatRoomSchema = new Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'chat',
    },
    messages: [MessageSchema],
});

const DetailChatRoomModel = mongoose.model('detailChat', DetailChatRoomSchema);
module.exports = DetailChatRoomModel;
