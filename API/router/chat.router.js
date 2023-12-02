const express = require('express');
const chatRouter = express.Router();
const chatController = require('../controller/chat.controller');

chatRouter.post('/api/create/chat', chatController.createChat);
chatRouter.get('/api/search/user', chatController.findUserChat);
chatRouter.post('/api/send/message', chatController.sendMessage);

module.exports = chatRouter;
