const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

	name: {

		type: String,
		required: [true, "Name is Required"]

	},

	description: {

		type: String,
		required: [true, "Description is Required"]

	},

	price: {

		type: Number,
		required: [true, "Email is Required"]

	},

	stock: {

    type: Number,
    required: [true, "Stock is Required"]

    },

	picture: {

		type: String, 
		required: [true, "Picture is Required"]

	},

	isActive : {

		type: Boolean,
		default: true

	},

	createdOn: {

		type: Date,
		default: Date.now()
	}

});

module.exports = mongoose.model("Product", productSchema);