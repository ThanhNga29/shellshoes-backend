const CartModel = require('../../models/cart.model');
const ProductModel = require('../../models/product.model');
const AccountModel = require('../../models/user.model');
const SiteController = require('./site.controller');
const { checkSaleOneProduct } = require('./sale.controller');

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
            //const unitPrice = product.price_product;
            //const price = unitPrice * quantity;
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
                // cart.detail_cart[cartItemIndex].price =
                //     cart.detail_cart[cartItemIndex].price + price;
            } else {
                cart.detail_cart.push({
                    id_product: id_product,
                    quantity: quantity,
                    size: size,
                    // unitPrice: unitPrice,
                    // price: price,
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
    //api/cart
    getDetailCart1: async (productId, userId) => {
        const cartDetail = await CartModel.findOne(
            { id_user: userId, 'detail_cart.id_product': productId },
            { 'detail_cart.$': 1 },
        );
        return cartDetail.detail_cart[0];
    },

    getCartProduct1: async (req, res, next) => {
        try {
            const userId = req.user.userId;
            //console.log('userId', userId);
            const cart = await CartModel.findOne({ id_user: userId });
            //console.log('cart:', cart);
            if (!cart) {
                return res.status(404).json({
                    sucess: false,
                    message: 'The cart not found',
                });
            }
            const findIdProduct = cart.detail_cart.map((product) => product.id_product.toString());
            console.log('findIdProduct:', findIdProduct);
            const resultCheckSaleProduct = [];
            for (const checkSale of findIdProduct) {
                //console.log('checkSale:', checkSale);
                const doneCheckSaleOne = await checkSaleOneProduct(checkSale);
                console.log('doneCheckSaleOne:', doneCheckSaleOne);
                const detailCart = await cartController.getDetailCart(checkSale, userId);
                //console.log('detailCart:', detailCart);
                const result = { ...doneCheckSaleOne._doc };
                result.quantity = detailCart.quantity;
                result.size = detailCart.size;
                //console.log('result0:', result);
                if (doneCheckSaleOne.salePrice) {
                    //console.log(123);
                    result.unitPrice = doneCheckSaleOne.salePrice;
                    result.price = doneCheckSaleOne.salePrice * detailCart.quantity;
                } else {
                    result.unitPrice = doneCheckSaleOne.price_product;
                    result.price = doneCheckSaleOne.price_product * detailCart.quantity;
                }
                resultCheckSaleProduct.push(result);
            }
            //console.log('doneCheck:', resultCheckSaleProduct);
            return res.status(200).json({
                success: true,
                data: resultCheckSaleProduct,
            });
        } catch (error) {
            res.status(500).json({
                sucess: false,
                message: 'Failed to get cart product!',
            });
        }
    },
    getDetailCart: async (productId, userId, size) => {
        const cartDetail = await CartModel.findOne(
            { id_user: userId, 'detail_cart.id_product': productId, 'detail_cart.size': size },
            { 'detail_cart.$': 1 },
        );
        return cartDetail ? cartDetail.detail_cart[0] : null;
    },
    getCartProduct: async (req, res, next) => {
        try {
            const userId = req.user.userId;
            const cart = await CartModel.findOne({ id_user: userId });

            if (!cart) {
                return res.status(404).json({
                    success: false,
                    message: 'The cart not found',
                });
            }
            //console.log(cart.detail_cart);
            const resultCheckSaleProduct = [];
            console.log('cartDetailCart:', cart.detail_cart);
            for (const cartItem of cart.detail_cart) {
                console.log('cartItem:', cartItem);
                const doneCheckSaleOne = await checkSaleOneProduct(cartItem.id_product);
                const detailCart = await cartController.getDetailCart(
                    cartItem.id_product,
                    userId,
                    cartItem.size,
                );

                const result = {
                    ...doneCheckSaleOne._doc,
                    _id: cartItem._id,
                    id_product: cartItem.id_product,
                };
                //console.log('result:', result);

                result.quantity = detailCart.quantity;
                result.size = detailCart.size;

                if (doneCheckSaleOne.salePrice) {
                    result.unitPrice = doneCheckSaleOne.salePrice;
                    result.price = doneCheckSaleOne.salePrice * detailCart.quantity;
                } else {
                    result.unitPrice = doneCheckSaleOne.price_product;
                    result.price = doneCheckSaleOne.price_product * detailCart.quantity;
                }

                resultCheckSaleProduct.push(result);
            }

            return res.status(200).json({
                success: true,
                data: resultCheckSaleProduct,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
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
            //console.log(newUnitPrice);
            const newQuantity = req.body.quantity;
            //console.log(newQuantity);
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
