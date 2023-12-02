const ChatModel = require('../../models/chat.model');
const UserModel = require('../../models/user.model');
const DetailChatRoomModel = require('../../models/detailChat.model');
const chatController = {
    createChat: async (req, res, next) => {
        try {
            const { firstId, secondId } = req.body;
            //console.log(req.body);
            const findChat = await ChatModel.findOne({
                members: { $all: [firstId, secondId] },
            });
            if (findChat) {
                return res.status(200).json(findChat);
            }
            const newChat = new ChatModel({
                members: [firstId, secondId],
            });
            //console.log(newChat);
            const response = await newChat.save();
            const detailChat = new DetailChatRoomModel({
                roomId: response._id,
            });
            const detailChatRoom = await detailChat.save();
            return res.status(200).json(response);
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    findUserChat: async (req, res, next) => {
        try {
            const search = req.query.search;
            const fullNameUser = await UserModel.find({
                fullname: { $regex: '.*' + search + '.*', $options: 'i' },
            });
            if (fullNameUser.length > 0) {
                return res.status(200).json({
                    sucess: true,
                    data: fullNameUser,
                });
            } else {
                return res.status(404).json({
                    sucess: true,
                    msg: 'Full name not found!',
                });
            }
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    sendMessage: async (req, res, next) => {
        try {
            const { roomId, senderId, content } = req.body;
            //console.log(req.body);
            const chat = await DetailChatRoomModel.findOne({ roomId: roomId });
            if (!chat) {
                return res.status(404).json({
                    sucess: false,
                    message: 'The room chat not found!',
                });
            }
            const newMessage = {
                senderId,
                content,
            };
            const detailChat = await DetailChatRoomModel.findOneAndUpdate(
                { roomId },
                { $push: { messages: newMessage } },
                { new: true },
            );
            return res.status(200).json({
                sucess: true,
                data: detailChat,
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
};
module.exports = chatController;
