const CartModel = require('../../models/cart.model');
const ProductModel = require('../../models/product.model');
const AccountModel = require('../../models/user.model');
const SiteController = require('./site.controller');

const cartController = {
    // api/add_to_cart
    addToCart: async (req, res, next) => {
        try {
            //console.log(req.body);
            const id_product = req.body.id_product;
            const quantity = req.body.quantity;
            const product = await ProductModel.findOne({
                _id: id_product,
            });
            //console.log(product);
            if (!product) {
                return res.status(500).json('Product not found');
            }
            //console.log(product);
            const unitPrice = product.newPrice_product;
            const price = unitPrice * quantity;
            const userId = req.user.userId;
            //console.log(unitPrice, price, userId);
            let cart = await CartModel.findOne({ id_user: userId });

            if (!cart) {
                cart = new CartModel({
                    id_user: userId,
                    detail_cart: [],
                });
            }
            const size = req.body.size;
            //console.log(size);
            //console.log(cart.detail_cart);
            const cartItemIndex = cart.detail_cart.findIndex(
                (item) => item.id_product == id_product && item.size == size,
            );
            //console.log(cartItemIndex);
            if (cartItemIndex !== -1) {
                cart.detail_cart[cartItemIndex].quantity =
                    cart.detail_cart[cartItemIndex].quantity + quantity;
                cart.detail_cart[cartItemIndex].price =
                    cart.detail_cart[cartItemIndex].price + price;
            } else {
                cart.detail_cart.push({
                    id_product: id_product,
                    quantity: quantity,
                    size: size,
                    unitPrice: unitPrice,
                    price: price,
                });
            }
            await cart.save();
            const populateCart = await CartModel.findOne({ id_user: userId })
                .populate({
                    path: 'detail_cart.id_product',
                    select: 'name_product image',
                })
                .select('detail_cart');
            return res.status(200).json({
                sucess: true,
                data: populateCart,
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Failed to add the product to the cart',
                message: error.message,
            });
        }
    },
    // api/cart/delete/:_id
    deleteProductInCart: async (req, res, next) => {
        try {
            const productId = req.params._id;
            const userId = req.user.userId;

            const cart = await CartModel.findOne({ id_user: userId });
            if (!cart) {
                return res.status(500).json('Cart not found');
            }
            const cartItemIndex = cart.detail_cart.findIndex((item) => item._id == productId);
            //console.log(cartItemIndex);
            if (cartItemIndex !== -1) {
                cart.detail_cart.splice(cartItemIndex, 1);
                await cart.save();
            }
            return res.status(200).json({
                success: true,
                data: cart.detail_cart[0],
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    // api/cart
    getCartProduct: async (req, res, next) => {
        try {
            const userId = req.user.userId;
            //console.log(userId);
            const cart = await CartModel.find({ id_user: userId })
                .populate({
                    path: 'detail_cart.id_product',
                    select: 'name_product image',
                })
                .exec();
            if (!cart) {
                return res.status(404).json({
                    sucess: false,
                    message: 'The cart not found',
                });
            }
            return res.status(200).json({
                success: true,
                data: cart,
            });
        } catch (error) {
            res.status(500).json({
                sucess: false,
                message: 'Failed to get cart product!',
            });
        }
    },
    // api/cart/edit/:_id
    editCart: async (req, res, next) => {
        try {
            const userId = req.user.userId;
            const idProductCart = req.params._id;
            const newSize = req.body.size;
            const newUnitPrice = req.body.unitPrice;
            console.log(newUnitPrice);
            const newQuantity = req.body.quantity;
            console.log(newQuantity);
            const newprice = newQuantity * newUnitPrice;
            const cart = await CartModel.findOneAndUpdate(
                {
                    id_user: userId,
                    'detail_cart._id': idProductCart,
                },
                {
                    $set: {
                        'detail_cart.$.size': newSize,
                        'detail_cart.$.quantity': newQuantity,
                        'detail_cart.$.unitPrice': newUnitPrice,
                        'detail_cart.$.price': newprice,
                    },
                },
                {
                    new: true,
                },
            )
                .populate({
                    path: 'detail_cart.id_product',
                    select: 'name_product image',
                })
                .select('detail_cart')
                .exec();
            if (!cart) {
                return res.status(404).json({
                    sucess: false,
                    message: 'Cart not found',
                });
            }
            return res.status(200).json({
                sucess: true,
                message: 'Updated cart sucessfully',
                data: cart,
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: error.message,
            });
        }
    },
};

module.exports = cartController;
