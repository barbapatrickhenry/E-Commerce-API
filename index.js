const express = require("express");
const mongoose = require("mongoose");

const userRoutes = require("./routes/user");

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

if(require.main === module){

	app.listen(process.env.PORT || port, () => {
		console.log(`API is now online on port ${ process.env.PORT || port }`)
	})

}

module.exports = { 	app, mongoose };