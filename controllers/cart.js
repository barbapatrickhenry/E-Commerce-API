const bcrypt = require('bcrypt');

const Cart = require("../models/Cart");
const User = require("../models/User");
const Product = require("../models/Product");

const auth = require("../auth");

module.exports.getUserCart = (req, res) => {

  try {

    return Cart.find({ userId : req.user.id })
      .then((userCart) => {

        if (userCart.length > 0) {

          return res.status(200).send({ userCart });

        } else {

          return res.status(404).send({
            message: "The User's Cart Does Not Exists at the Moment.",

          });
        }
      })
      .catch((err) => {

        console.error("Error in Finding  the Cart", err);

        return res
          .status(500)
          .send({ error: "Error Finding the Cart of the User " });
      });

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });

  }
};

module.exports.addToCart = async (req, res) => {
  const userId = req.user.id;
  const cartItems = req.body.cartItems; 

  if (!Array.isArray(cartItems)) {
    return res.status(400).json({ message: "Invalid cart items format" });
  }

  try {
    let userCart = await Cart.findOne({ userId });

    if (!userCart) {
      userCart = new Cart({
        userId,
        cartItems: [],
        totalPrice: 0,
      });
    }

    for (const cartItem of cartItems) {
      const { productId, quantity } = cartItem;
      const product = await Product.findById(productId);

      if (!product || !product.isActive) {
        return res.status(404).json({ message: "Product Not Found or Inactive" });
      }

      let subtotal = product.price * quantity;
      const productIndex = userCart.cartItems.findIndex(
        (item) => item.productId === productId
      );

      if (productIndex !== -1) {
        userCart.cartItems[productIndex].quantity += quantity;
        userCart.cartItems[productIndex].subtotal += subtotal;
      } else {
        userCart.cartItems.push({
          productId,
          quantity,
          subtotal,
        });
      }

      userCart.totalPrice += subtotal;
    }

    await userCart.save();
    res.status(201).json({ message: "Products Added to Cart Successfully", cart: userCart });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.updateCartItemQuantity = async (req, res) => {

  const userId = req.user.id;
  const updatedCartItems = req.body;

  try {

    let userCart = await Cart.findOne({ userId });

    if (!userCart) {

      return res.status(404).json({ message: "User's cart not found" });

    }

    for (const updatedCartItem of updatedCartItems) {

      const { productId, quantity } = updatedCartItem;
      const product = await Product.findById(productId);

      if (!product || !product.isActive) {

        return res.status(404).json({ message: `Product with ID ${productId} not found or inactive` });

      }

      const newSubtotal = product.price * quantity;

      const productIndex = userCart.cartItems.findIndex(
        (item) => item.productId === productId
      );

      if (productIndex === -1) {

        return res.status(404).json({ message: `Product with ID ${productId} not found in the cart` });

      }

      userCart.cartItems[productIndex].quantity = quantity;
      userCart.cartItems[productIndex].subtotal = newSubtotal;
    }

    userCart.totalPrice = userCart.cartItems.reduce((total, item) => total + item.subtotal, 0);

    await userCart.save();

    res.status(200).json({ message: "Cart item quantities updated successfully", cart: userCart });

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
    
  }
};

module.exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params; 
    const userId = req.user.id;

    let cart = await Cart.findOne({ userId });

    cart.cartItems = cart.cartItems.filter(
      (item) => !productId.includes(item.productId)
    );

    cart.totalPrice = cart.cartItems.reduce(
      (total, item) => total + item.subtotal,
      0
    );

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while removing products from the cart.");
  }
};

module.exports.clearCart = async (req, res) => {
  const { userId } = req.body;
  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: "Cart Not Found" });
    }
    cart.cartItems = [];
    cart.totalPrice = 0; 
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};