const express = require('express');
const blogRouter = express.Router();
const blogController = require('../controller/blog.controller');
const tokenMiddleware = require('../../middleware/token.mid');
const uploadMiddleware = require('../../middleware/upload.mid');

blogRouter.post(
    '/api/createBlog',
    tokenMiddleware.verifyTokenAndAdmin,
    uploadMiddleware.single('image'),
    blogController.createBlog,
);
blogRouter.put(
    '/api/update/blog/:_id',
    tokenMiddleware.verifyTokenAndAdmin,
    uploadMiddleware.single('image'),
    blogController.updateBlog,
);
blogRouter.delete(
    '/api/delete/blog/:_id',
    tokenMiddleware.verifyTokenAndAdmin,
    blogController.deleteBlog,
);
blogRouter.get('/api/all/blog', blogController.allBlog);
blogRouter.get('/api/blog/detail/:_id', blogController.detailBlog);
module.exports = blogRouter;
