const express = require('express');
const siteRouter = express.Router();
const siteController = require('../controller/site.controller');

siteRouter.post('/api/login', siteController.postLogin);
siteRouter.post('/api/signup', siteController.postSignup);

module.exports = siteRouter;
