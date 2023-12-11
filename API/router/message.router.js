const express = require('express');
const messageRouter = express.Router();
const messageController = require('../controller/message.controller');

messageRouter.post('/api/send/message', messageController.sendMessage);
messageRouter.get('/api/message/:_id', messageController.getRoomMessage);

module.exports = messageRouter;
