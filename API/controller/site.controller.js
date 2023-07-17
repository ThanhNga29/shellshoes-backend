const AccountModel = require('../../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SiteController = {
    //CREATE JWT
    getAccessToken: (item) => {
        return jwt.sign(
            {
                userId: item._id,
                isAdmin: item.isAdmin,
            },
            'password',
            { expiresIn: '12d' },
        );
    },
    //[POST] login
    postLogin: async (req, res) => {
        try {
            const Email = req.body.email;
            const Password = req.body.password;
            const ExistingEmail = await AccountModel.findOne({
                email: Email,
            });
            if (!ExistingEmail) {
                res.status(500).json({
                    message: 'User not found!',
                });
            }
            const validPassword = await bcrypt.compare(req.body.password, ExistingEmail.password);
            if (!validPassword) {
                return res.status(404).json({ message: 'Wrong password!' });
            }
            const accessToken = SiteController.getAccessToken(ExistingEmail);
            if (ExistingEmail && validPassword) {
                console.log(accessToken);
                const { password, ...others } = user._doc;
                return res.status(200).json({
                    message: 'Ban dang nhap thanh cong',
                    //
                });
            } else {
                return res.status(500).json({
                    message: 'Dang nhap that bai',
                });
            }
        } catch (error) {
            return res.status(500).json({
                message: error.message,
            });
        }
    },
    //[POST] signup
    postSignup: async (req, res) => {
        try {
            const Email = req.body.email;
            const Numberphone = req.body.numberphone;

            const existedEmail = await AccountModel.findOne({
                email: Email,
            });
            const existedNumberphone = await AccountModel.findOne({
                numberphone: Numberphone,
            });
            if (existedEmail) {
                return res.status(400).json({
                    message: 'Email nay da ton tai!',
                });
            } else if (existedNumberphone) {
                return res.status(400).json({
                    message: 'So dien thoai da ton tai!',
                });
            }
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(req.body.password, salt);
            //create the new user account
            const newUser = await new AccountModel({
                fullname: req.body.fullname,
                numberphone: req.body.numberphone,
                email: req.body.email,
                password: hashPassword,
                isAdmin: req.body.isAdmin,
            });
            //save the new user account
            const user = await newUser.save();
            res.status(200).json('Tao user thanh cong');
        } catch {
            res.status(500).json({ message: error.message });
        }
    },
    //[POST] logout
};

module.exports = SiteController;
