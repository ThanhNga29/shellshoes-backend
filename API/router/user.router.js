const express = require('express');
const userRouter = express.Router();
const userController = require('../controller/user.controller');
const tokenMiddleware = require('../../middleware/token.mid');

userRouter.get(
    '/api/admin/allusers',
    tokenMiddleware.verifyTokenAndAdmin,
    userController.getAllUser,
);
userRouter.get(
    '/api/user/account/:_id',
    tokenMiddleware.verifyTokenAndUserAuthor,
    userController.getUser,
);

module.exports = userRouter;
