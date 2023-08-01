const CategoryModel = require('../../models/category.model');
const uploadMiddleware = require('../../middleware/upload.mid');
const cloudinary = require('cloudinary').v2;

const CategoryController = {
    //[GET] /api/category/all
    getAllCategory: async (req, res, next) => {
        try {
            const allCategory = await CategoryModel.find();
            return res.status(200).json(allCategory);
        } catch (error) {
            return res.status(500).message({
                message: error.message,
            });
        }
    },
    //[GET] /api/category/:_id
    getDetailCategory: async (req, res, next) => {
        try {
            const id_category = req.params._id;
            const detailCategory = await CategoryModel.findOne({
                _id: id_category,
            });
            if (!detailCategory) {
                res.status(404).json({
                    message: 'The category not found!',
                });
            }
            res.status(200).json(detailCategory);
        } catch (error) {
            return res.status(500).json({
                message: error.message,
            });
        }
    },
    //[POST] /api/category/create
    createNewCategory: async (req, res, next) => {
        try {
            const Category = req.body.category;
            const existedCategory = await CategoryModel.findOne({
                category: Category,
            });
            if (existedCategory) {
                return res.status(400).json({
                    message: 'The category is existed!',
                });
            }
            const newCategory = await new CategoryModel({
                category: req.body.category,
                image: req.file.path,
            });
            const category = await newCategory.save();
            res.status(200).send(newCategory);
        } catch (error) {
            if (req.file) {
                cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(500).json({ error: error.message });
        }
    },
    //[PUT] /api/category/edit/:_id
    updateCategory: async (req, res, next) => {
        try {
            const updatedCategoryData = {
                category: req.body.category,
            };
            if (req.file) {
                updatedCategoryData.image = req.file.path;
            }
            const conditionalCategoryData = {
                _id: req.params._id,
            };
            const updatedCategory = await CategoryModel.findOneAndUpdate(
                conditionalCategoryData,
                updatedCategoryData,
                {
                    new: true,
                },
            );
            return res.status(200).json({
                message: 'Updated category sucessfully!',
                data: updatedCategory,
            });
        } catch (error) {
            return res.status(500).json({
                error: error.message,
            });
        }
    },
    //[DELETE] /api/category/delete/:_id
    deleteCategory: async (req, res, next) => {
        try {
            const deleteCategory = await CategoryModel.findByIdAndRemove(req.params._id);
            if (deleteCategory) {
                return res.status(200).json({
                    sucess: true,
                    message: 'The category is deleted!',
                });
            } else {
                return res.status(404).json({
                    sucess: false,
                    message: 'The category not found!',
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

module.exports = CategoryController;
