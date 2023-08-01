const CartModel = require('../../models/cart.model');
const ProductModel = require('../../models/product.model');
const AccountModel = require('../../models/user.model');
const SiteController = require('./site.controller');

const cartController = {
    //[POST] /api/user/:_id/add_to_cart
    addToCart: async (req, res, next) => {
        try {
            const { id_product, quantity, size, unitPrice } = req.body;
            const user1 = req.user.userId;
            console.log(user1);
            //const IdUser = await AccountModel.findOne({ _id: id_user });
            const productToAdd = {
                //id_user: user1,
                detail_cart: [
                    {
                        id_product: id_product,
                        quantity: quantity,
                        size: size,
                        unitPrice: unitPrice,
                        price: quantity * unitPrice,
                    },
                ],
            };
            // let cart = await CartModel.findOne({
            //     id_user: user1,
            // });
            // if (!cart) {
            //     cart = new CartModel(productToAdd);
            // }
            // const existingProductIndex = CartModel.detail_cart.findIndex(
            //     (items) => items.id_product.toString() === id_product && items.size === size,
            // );
            // if (existingProductIndex) {
            //     //CartModel.detail_cart[existingProductIndex].quantity += quantity;
            //     //CartModel.detail_cart[existingProductIndex].price += price;
            //     existingProductIndex.quantity += quantity;
            //     existingProductIndex.price =
            //         existingProductIndex.quantity * existingProductIndex.unitPrice;
            // } else {
            //     CartModel.detail_cart.push(productToAdd);
            // }
            CartModel.push(productToAdd);
            await productToAdd.save();
            res.status(200).json({
                sucess: true,
                message: 'The product is added to cart',
            });
        } catch (error) {
            res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
        //     try {
        //         const { id_product, quantity, size } = req.body;
        //         const id_user = req.user.userId;
        //         const existingProduct = await CartModel.findOne({
        //             detail_cart: {
        //                 id_product: id_product,
        //             },
        //             size: size,
        //         });
        //         if (existingProduct) {
        //             existingProduct.
        //         }
        //     } catch (error) {}
    },
};

module.exports = cartController;
