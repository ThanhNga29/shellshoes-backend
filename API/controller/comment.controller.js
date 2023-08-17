const moment = require('moment');
const ProductModel = require('../../models/product.model');
const AccountModel = require('../../models/user.model');
const CommentModel = require('../../models/comment.model');

const commentController = {
    // api/comment/:_id
    postComment: async (req, res, next) => {
        try {
            const idProduct = req.params._id;
            //console.log(idProduct);
            const userId = req.user.userId;
            //console.log(userId);
            //const formattedTimestamp = moment().toDate();
            //format('DD/MM/YYYY HH:mm');
            const data = await new CommentModel({
                id_product: idProduct,
                id_user: userId,
                content: req.body.content,
                //timestamp: formattedTimestamp,
            });

            const saveData = await data.save();

            const nameUser = await saveData.populate({
                path: 'id_user',
                select: 'fullname',
            });
            const formattedTimestamp = moment(data.timestamp).format('DD/MM/YYYY HH:mm');
            return res.status(200).json({
                message: 'Post comment sucessfully!',
                data: {
                    ...nameUser._doc,
                    timestamp: formattedTimestamp,
                },
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    // api/comments/all/:_id
    allComment: async (req, res, next) => {
        try {
            const id_product = req.params._id;
            //const formattedTimestamp = moment().format('DD/MM/YYYY HH:mm');
            const allcomment = await CommentModel.find({ id_product: id_product })
                .populate({
                    path: 'id_user',
                    select: 'fullname',
                })
                .sort({ timestamp: 1 })
                .exec();
            const formattedComments = allcomment.map((comment) => {
                return {
                    ...comment._doc,
                    timestamp: moment(comment.timestamp).format('DD/MM/YYYY HH:mm'),
                };
            });

            return res.status(200).json({
                success: true,
                data: formattedComments,
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    // api/comments/edit/:_id
    editComment: async (req, res, next) => {
        try {
            const conditionalComment = {
                _id: req.params._id,
                id_user: req.user.userId,
            };
            const formattedTimestamp = moment().format('DD/MM/YYYY HH:mm');
            const updatedCommentData = {
                content: req.body.content,
                id_user: req.user.userId,
                timestamp: formattedTimestamp,
            };
            const existingComment = await CommentModel.findOne(conditionalComment);
            if (!existingComment) {
                return res.status(404).json({
                    sucess: false,
                    message: 'Comment not found or unauthorized',
                });
            }
            const updatedComment = await CommentModel.findOneAndUpdate(
                conditionalComment,
                updatedCommentData,
                {
                    new: true,
                },
            )
                .populate({
                    path: 'id_user',
                    select: 'fullname',
                })
                .exec();
            // const formattedComments = {
            //     ...updatedComment._doc,
            //     timestamp: moment(updatedComment.timestamp).format('DD/MM/YYYY HH:mm'),
            // };
            return res.status(200).json({
                sucess: true,
                message: 'Updated comment sucessful!',
                data: {
                    ...updatedComment._doc,
                    timestamp: formattedTimestamp,
                },
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    // api/comment/delete/:_id
    deleteComment: async (req, res, next) => {
        try {
            const _id = req.params._id;
            const deleteComment = await CommentModel.findByIdAndRemove(_id);
            if (deleteComment) {
                return res.status(200).json({
                    sucess: true,
                    message: 'comment is deleted!',
                });
            } else {
                return res.status(404).json({
                    sucess: false,
                    message: 'Comment not found!',
                });
            }
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
};

module.exports = commentController;
