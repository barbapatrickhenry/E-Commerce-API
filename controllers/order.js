const bcrypt = require('bcrypt');
const auth = require("../auth");
const Order = require("../models/Order.js");
const Cart = require("../models/Cart.js");
const User = require("../models/User");
const Product = require("../models/Product");

module.exports.createOrder = async (req, res) => {

  const userId = req.user.id;

  try {

    const user = await User.findById(userId);

        if (user.isAdmin) {

          return res.status(403).json({ message: "Admins are Not Allowed to Make a Checkout" });

        }

    const cart = await Cart.findOne({ userId });

    if (!cart) {

      return res.status(404).json({ message: "Cart not found" });

    }
  
    const { cartItems, totalPrice } = cart;

    for (const item of cartItems) {

      const product = await Product.findById(item.productId);

      if (!product) {

        return res.status(404).json({ message: "Product Not Found" });

      }

      if (!product.stock) {

        return res.status(404).json({
            message: "Kindly Notify the Admin About the Product's Stock",
          });

      }

      if (item.quantity > product.stock) {

        return res.status(400).json({ message: "Insufficient Inventory Stock for the Product" });

      }

      product.stock -= item.quantity;
      await product.save();

    }

    const orderedProducts = new Order({

      userId: userId,
      productsOrdered: cart.cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
      totalPrice: cart.totalPrice,

    });


    const checkout = await orderedProducts.save();
    cart.cartItems = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json({ message: "Order created successfully", checkout });

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });

  }
};


module.exports.retrievedByAdmin = async (req, res) => {
  try {

    const orders = await Order.find({});

    if (!orders || orders.length === 0) {

      return res.status(404).json({ message: "No Orders Found" });

    }

    res.status(200).json({ message: "Orders Retrieved Successfully", orders });

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });

  }
};


module.exports.retrievedByAuthUser = async (req, res) => {

  console.log(req.user.id);
  const userId = req.user.id;

  try {

    if (req.user.isAdmin) {

      return res.status(403).send({ message: "Admin Access is Not Allowed" });

    } else {

      const orders = await Order.find({ userId });

      if (!orders || orders.length === 0) {

        return res.status(404).json({ message: "No Orders Found" });

      }

      res.status(200).json({ message: "Order Retrieved Successfully", orders });
    }

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });

  }
};