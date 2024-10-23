const express = require("express");
const mongoose = require("mongoose");

const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");

const port = 4000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended : true }));

mongoose.connect("mongodb+srv://admin:admin123@b337.j7vrqc4.mongodb.net/E-Commerce-API?retryWrites=true&w=majority&appName=B337",
	{
		useNewUrlParser : true,
		useUnifiedTopology : true
	}
);

mongoose.connection.once("open", () => console.log("Now connected to MongoDB Atlas"));

app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/carts', cartRoutes);
app.use('/orders', orderRoutes);

if(require.main === module){

	app.listen(process.env.PORT || port, () => {
		console.log(`API is now online on port ${ process.env.PORT || port }`)
	})

}

module.exports = { 	app, mongoose };