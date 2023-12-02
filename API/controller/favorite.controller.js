const FavoriteModel = require('../../models/favorite.model');

const favoriteController = {
    postFavorite: async (req, res, next) => {
        try {
            const id_user = req.user.userId;
            const id_product = req.body.id_product;
            const saveFavorite = new FavoriteModel({
                id_product: id_product,
                id_user: id_user,
            });
            await saveFavorite.save();
            return res.status(200).json({
                sucess: true,
                data: saveFavorite,
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    deleteFavorite: async (req, res, next) => {
        try {
            const id_user = req.user.userId;
            const id_product = req.body.id_product;
            const deleteFavorite = await FavoriteModel.deleteMany({
                id_product: id_product,
                id_user: id_user,
            });
            if (deleteFavorite.deletedCount > 0) {
                return res.json({
                    sucess: false,
                    message: 'Favorite deleted sucessfully!',
                });
            } else {
                return res.json({
                    success: false,
                    message: 'Favorite not found or already deleted',
                });
            }
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    allFavorite: async (req, res, next) => {
        try {
            const id_user = req.user.userId;
            const findFavorite = await FavoriteModel.find({ id_user: id_user });
            return res.status(200).json({
                sucess: true,
                data: findFavorite,
            });
        } catch (error) {
            return res.status(200).json({
                sucess: false,
                message: error.message,
            });
        }
    },
    mostProductFavorite: async (req, res, next) => {
        try {
            const mostProductFavorites = await FavoriteModel.aggregate([
                {
                    $group: {
                        _id: '$id_product',
                        totalQuantity: { $sum: 1 },
                    },
                },
                {
                    $sort: {
                        totalQuantity: -1,
                    },
                },
            ]);
            return res.status(200).json({
                sucess: true,
                data: mostProductFavorites,
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
};

module.exports = favoriteController;
