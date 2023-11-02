const moment = require('moment');
const ProductModel = require('../../models/product.model');
const BlogModel = require('../../models/blog.model');
const uploadMiddleware = require('../../middleware/upload.mid');
const cloudinary = require('cloudinary').v2;

const BlogController = {
    createBlog: async (req, res, next) => {
        try {
            //console.log(req.body);
            const title = req.body.title;
            //console.log(title);
            const body = req.body.body;
            const id_product = JSON.parse(req.body.id_product);
            const createAt = moment.utc(req.body.createAt, 'DD-MM-YYYY HH:mm').toDate();
            //console.log(typeof createAt);
            const endDate = moment.utc(req.body.endDate, 'DD-MM-YYYY HH:mm').toDate();
            const isValidStartEnd = moment(endDate).isSameOrAfter(createAt, 'minute');
            //console.log(isValidStartEnd);
            if (isValidStartEnd) {
                const newBlog = await new BlogModel({
                    title: title,
                    body: body,
                    image: req.file.path,
                    id_product: id_product,
                    createAt: createAt,
                    endDate: endDate,
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
            const id_product = JSON.parse(req.body.id_product);
            const updatedBlogData = {
                title: req.body.title,
                body: req.body.body,
                createAt: moment.utc(req.body.createAt, 'DD-MM-YYYY HH:mm').toDate(),
                endDate: moment.utc(req.body.endDate, 'DD-MM-YYYY HH:mm').toDate(),
                id_product: id_product,
            };
            if (req.file) {
                updatedBlogData.image = req.file.path;
            }
            const conditionalBlogData = {
                _id: req.params._id,
            };
            const updatedBlog = await BlogModel.findOneAndUpdate(
                conditionalBlogData,
                updatedBlogData,
                {
                    new: true,
                },
            );
            return res.status(200).json({
                message: 'Updated blog sucessfully!',
                data: updatedBlog,
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                error: error.message,
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
    allBlog: async (req, res, next) => {
        try {
            const id_Blog = await BlogModel.find().populate({
                path: 'id_product',
            });
            //console.log(id_Blog);
            const now = new Date();
            //console.log(now);
            const filterBlogs = id_Blog.filter((blog) => {
                return moment(now).isBetween(moment(blog.createAt), moment(blog.endDate));
            });
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
};

module.exports = BlogController;
