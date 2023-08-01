const express = require('express');
const userRouter = express.Router();
const userController = require('../controller/user.controller');
const tokenMiddleware = require('../../middleware/token.mid');
const AccountModel = require('../../models/user.model');

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
userRouter.put(
    '/api/user/account/edit/:_id',
    tokenMiddleware.verifyTokenAndUser,
    userController.putUser,
);
userRouter.delete(
    '/api/user/delete/:_id',
    tokenMiddleware.verifyTokenAndUserAuthor,
    userController.deleteUser,
);
module.exports = userRouter;
