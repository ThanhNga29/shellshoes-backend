const express = require('express');
const commentRouter = express.Router();
const commentController = require('../controller/comment.controller');
const tokenMiddleware = require('../../middleware/token.mid');

commentRouter.post(
    '/api/comment/:_id',
    tokenMiddleware.verifyTokenAndUserAuthor,
    commentController.postComment,
);
commentRouter.get('/api/comment/all/:_id', commentController.allComment);
commentRouter.put(
    '/api/comment/edit/:_id',
    tokenMiddleware.verifyTokenAndUser,
    commentController.editComment,
);
commentRouter.delete(
    '/api/comment/delete/:_id',
    tokenMiddleware.verifyTokenAndUserAuthor,
    commentController.deleteComment,
);

module.exports = commentRouter;
