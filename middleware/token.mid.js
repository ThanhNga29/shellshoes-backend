const jwt = require('jsonwebtoken');
const AccountModel = require('../models/user.model');
const { token } = require('morgan');
const path = require('path');

const tokenMiddleware = {
    //check login
    verifyToken: (req, res, next) => {
        try {
            const token = req.headers.token;
            const userId = jwt.verify(token, 'password');
            AccountModel.findOne({
                _id: userId,
            });
            req.user = userId;
            next();
        } catch (err) {
            res.status(500).json('token is not valid');
        }
    },
    verifyTokenAndUserAuthor: (req, res, next) => {
        verifyToken(req, res, () => {
            if (req.user.id === req.params.id || req.user.isAdmin) {
                next();
            } else {
                return res.status(403).json('You are not allowed to do that');
            }
        });
    },
    verifyTokenAndUser: (req, res, next) => {
        verifyToken(req, res, () => {
            if (req.user.isAdmin) {
                return res.status(403).json({
                    message: 'You are admin or not authorized',
                });
            } else {
                next();
            }
        });
    },
    verifyTokenAndAdmin: (req, res, next) => {
        const verifyToken = tokenMiddleware.verifyToken;
        verifyToken(req, res, () => {
            if (req.user.isAdmin) {
                next();
            } else {
                return res.status(403).json({
                    message: 'You are not allowed to do that!',
                });
            }
        });
    },
};
module.exports = tokenMiddleware;
