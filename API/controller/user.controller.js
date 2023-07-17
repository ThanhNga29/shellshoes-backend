const AccountModel = require('../../models/user.model');

const userController = {
    //[GET] /admin/users
    getAllUser: async (req, res, next) => {
        try {
            const user = await AccountModel.find({}, { password: 0, isAdmin: 0 });
            res.status(200).json(user);
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: err.message,
            });
        }
    },
    //[GET] user/account/:_id
    getUser: async (req, res, next) => {
        try {
            const user = await AccountModel.findOne({
                _id: req.params._id,
            });
            res.status(200).json(user);
        } catch (err) {
            res.status(500).json({
                message: err.message,
            });
        }
    },
    //[GET] /user/account/:_id/edit
    getEditUser: async (req, res, next) => {
        try {
            const user = await AccountModel.findOne({
                _id: req.params._id,
            });
            res.status(200).json(user);
        } catch (err) {
            message: err.message;
        }
    },
    //[PUT] /user/account/:_id/edit
    putUser: async (req, res, next) => {
        try {
            const updatedData = {
                fullname: req.body.fullname,
                numberphone: req.body.numberphone,
            };
            const conditionalData = {
                _id: req.params._id,
            };
            const updatedUser = await AccountModel.findOneAndUpdate(conditionalData, updatedData, {
                new: true,
            });
        } catch {
            return res.status(500).send(error);
        }
        return res.status(200).json({
            message: 'Updated User',
            data: updatedUser,
        });
    },
};

module.exports = userController;
