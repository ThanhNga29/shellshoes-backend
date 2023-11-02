const express = require('express');
const blogRouter = express.Router();
const blogController = require('../controller/blog.controller');
const tokenMiddleware = require('../../middleware/token.mid');
const uploadMiddleware = require('../../middleware/upload.mid');

blogRouter.post('/api/createBlog', uploadMiddleware.single('image'), blogController.createBlog);
blogRouter.put('/api/update/blog/:_id', blogController.updateBlog);
blogRouter.delete('/api/delete/blog/:_id', blogController.deleteBlog);
blogRouter.get('/api/all/blog', blogController.allBlog);
module.exports = blogRouter;
