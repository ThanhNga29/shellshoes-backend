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
            process.env.JWT_SECRET,
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
                res.status(404).json({
                    message: 'User not found!',
                });
            }
            const validPassword = await bcrypt.compare(Password, ExistingEmail.password);
            if (!validPassword) {
                return res.status(401).json({ message: 'Wrong password!' });
            }
            const accessToken = SiteController.getAccessToken(ExistingEmail);
            if (ExistingEmail && validPassword) {
                //console.log(accessToken);
                const { password, ...others } = ExistingEmail._doc;
                return res.status(200).json({
                    message: 'Logged in successfully',
                    accessToken: accessToken,
                    user: others,
                    //
                });
            } else {
                return res.status(500).json({
                    message: 'Failed login!',
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
                    message: 'Email is existed!',
                });
            } else if (existedNumberphone) {
                return res.status(400).json({
                    message: 'Numberphone is existed!',
                });
            }
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(req.body.password, salt);
            //create the new user account
            const newUser = await new AccountModel({
                fullname: req.body.fullname,
                Numberphone,
                Email,
                password: hashPassword,
                isAdmin: req.body.isAdmin,
            });
            //save the new user account
            const user = await newUser.save();
            return res.status(200).json('Create user sucessfully');
        } catch {
            return res.status(500).json({ message: error.message });
        }
    },
    //[POST] logout
};

module.exports = SiteController;
