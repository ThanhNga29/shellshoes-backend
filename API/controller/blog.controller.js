const moment = require('moment');
const ProductModel = require('../../models/product.model');
const BlogModel = require('../../models/blog.model');
const uploadMiddleware = require('../../middleware/upload.mid');
const cloudinary = require('cloudinary').v2;
const momentTimeZone = require('moment-timezone');
const { json } = require('body-parser');

const BlogController = {
    createBlog: async (req, res, next) => {
        try {
            const title = req.body.title;
            const body = req.body.body;
            const id_product = JSON.parse(req.body.id_product);
            //console.log(id_product);
            const createAt = moment.tz(req.body.createAt, 'DD-MM-YYYY HH:mm', 'Asia/Bangkok');
            console.log(createAt);
            const endDate = moment.tz(req.body.endDate, 'DD-MM-YYYY HH:mm', 'Asia/Bangkok');
            console.log(endDate);
            const isValidStartEnd = moment(endDate).isSameOrAfter(createAt, 'minute');
            if (isValidStartEnd) {
                const newBlog = await new BlogModel({
                    title: title,
                    body: body,
                    image: req.file.path,
                    id_product: id_product,
                    createAt: createAt.toDate(),
                    endDate: endDate.toDate(),
                });
                const savedBlog = await newBlog.save();
                return res.status(200).json({
                    sucess: true,
                    data: savedBlog,
                });
            } else {
                return res.status(400).json({
                    sucess: false,
                    message: 'The end time must be after or the same day as the start time',
                });
            }
            //const formattedTimestamp = moment().format('DD/MM/YYYY HH:mm')
        } catch (error) {
            if (req.file) {
                cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    updateBlog: async (req, res, next) => {
        try {
            // const id = req.body;
            // console.log(id);
            const id_product = JSON.parse(req.body.id_product);
            // console.log(id_product);
            const conditionalBlogData = {
                _id: req.params._id,
            };
            const blogId = await BlogModel.findById(conditionalBlogData);
            //console.log(blogId);
            if (!blogId) {
                return res.status(404).json({
                    sucess: false,
                    message: 'The blog not found!',
                });
            }
            //const updateData = req.body;
            const now = moment();
            //console.log(now);
            const createAt = moment(blogId.createAt).tz('Asia/Bangkok');
            //console.log(createAt);
            const endDate = moment(blogId.endDate).tz('Asia/Bangkok');
            //console.log(endDate);
            if (now.isBetween(createAt, endDate)) {
                return res.status(400).json({
                    sucess: false,
                    message: 'This blog is in time, please delete if you want remove the blog!',
                });
            }
            const updatedBlogData = {
                title: req.body.title,
                body: req.body.body,
                createAt: moment.tz(req.body.createAt, 'DD-MM-YYYY HH:mm', 'Asia/Bangkok'),
                endDate: moment.tz(req.body.endDate, 'DD-MM-YYYY HH:mm', 'Asia/Bangkok'),
                id_product: id_product,
                // createAt: moment.utc(req.body.createAt, 'DD-MM-YYYY HH:mm').toDate(),
                // endDate: moment.utc(req.body.endDate, 'DD-MM-YYYY HH:mm').toDate(),
            };

            if (req.file) {
                updatedBlogData.image = req.file.path;
            }

            const updatedBlog = await BlogModel.findOneAndUpdate(
                conditionalBlogData,
                updatedBlogData,
                {
                    new: true,
                },
            );

            return res.status(200).json({
                message: 'Updated blog successfully!',
                data: updatedBlog,
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    deleteBlog: async (req, res, next) => {
        try {
            const deleteBlog = await BlogModel.findByIdAndRemove(req.params._id);
            if (deleteBlog) {
                return res.status(200).json({
                    sucess: true,
                    message: 'The blog is deleted!',
                });
            } else {
                return res.status(404).json({
                    sucess: false,
                    message: 'The blog not found!',
                });
            }
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    //
    allBlog: async (req, res, next) => {
        try {
            const id_Blog = await BlogModel.find().populate({
                path: 'id_product',
            });
            const now = moment().utc();
            //console.log(now);
            const filterBlogs = id_Blog.filter((blog) => {
                const createAt = moment(blog.createAt).tz('Asia/Bangkok');
                const endDate = moment(blog.endDate).tz('Asia/Bangkok');
                return now.isBetween(createAt, endDate);
            });
            //console.log(filterBlogs);
            return res.status(200).json({
                sucess: true,
                data: filterBlogs,
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    detailBlog: async (req, res, next) => {
        try {
            const findBlog = await BlogModel.findOne({ _id: req.params._id })
                .populate({
                    path: 'id_product',
                })
                .exec();
            if (!findBlog) {
                return res.status(404).json({
                    sucess: false,
                    message: 'The blog not found!',
                });
            }
            return res.status(200).json({
                sucess: true,
                data: findBlog,
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
};

module.exports = BlogController;
