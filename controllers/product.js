const Product = require("../models/Product");

module.exports.addProduct = (req, res) => {

	try{

		let newProduct = new Product({

			name : req.body.name,
			description : req.body.description,
			price : req.body.price,
			stock: req.body.stock,
			picture : req.body.picture

		});

		Product.findOne({ name: req.body.name })
			.then(existingProduct => {

			if(existingProduct) {

				return res.status(409).send({ error: "Product already exists"});

			}

			return newProduct.save()
			.then(savedProduct => res.status(201).send(savedProduct))
			.catch(err => {

				console.error("Error in saving the product:", err);

				return res.status(500).send({ error: "Failed to save the product"});

			});

		}).catch(err => {

				console.error("Error in finding product: ", err);

				return res.status(500).send({ message: "Error finding the product" });

		});

	} catch(err) {

		console.error("Error in finding product: ", err);

		 return res.status(500).send({ message: "Internal Server Error" });

	}
		
};

module.exports.getAllProducts = (req, res) => {

	return Product.find({})
	.then(products => {

		if(products.length > 0){

		    return res.status(200).send(products);

		}
		else{
		    
		    return res.status(200).send({ message: 'No product found.' });

		}
	})
	.catch(err => {

		console.error("Error in finding all products", err);

		return res.status(500).send({ error: "Internal Server Error"});

	});
};

module.exports.getAllActive = (req, res) => {

	Product.find({ isActive: true })

	.then(products => {

		if (products.length > 0){

		    return res.status(200).send({ products});

		}

		else {

		    return res.status(200).send({message: "There are no product at the moment."});

		}
	})
	.catch(err => {

			console.error("Error in finding active products: ", err);
			return res.status(500).send({ error: "Internal Server Error"});

	});

};

module.exports.getProduct = (req, res) => {

	const productId = req.params.productId;

	Product.findById(productId)
	.then(product => {

		if (!product) {
			return res.status(404).send({ error: 'Product not found' });
		}

		return res.status(200).send({ product });

	})
	.catch(err => {

		console.error("Error in fetching the product: ", err)
		return res.status(500).send({ error: "Internal Server Error" });

	});	
};

module.exports.updateProduct = (req, res) => {

	const productId = req.params.productId;

	let updatedProduct = {

        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        stock: req.body.stock,
        picture: req.body.picture

    }

    return Product.findByIdAndUpdate(productId, updatedProduct, {new: true})
    .then(product => {

        if (product) {

        	return res.status(200).send({ 
					message: 'Product updated successfully',updatedProduct: product });

        } else {

        	return res.status(404).send({ error: 'Product not found' });

        }
    })
    .catch(err => {

    	console.error("Error in updating a product: ", err);

    	return res.status(500).send({ error: "Internal Server Error" });
    })
};

module.exports.archiveProduct = (req, res) => {

    let updateActiveField = {

        isActive: false

    }

    return Product.findByIdAndUpdate(req.params.productId, updateActiveField, {new: true})
    .then(archiveProduct => {

        if (!archiveProduct) {

        	return res.status(404).send({ error: 'Product not found' });

        }

        return res.status(200).send({ 

        	message: 'Product archived successfully', 
        	archiveProduct: archiveProduct 

        });

    }).catch(err => {

    	console.error("Error in archiving a product: ", err)
    	return res.status(500).send({ error: "Internal Server Error" });

    });
};

module.exports.activateProduct = (req, res) => {

    let updateActiveField = {

        isActive: true

    }

    return Product.findByIdAndUpdate(req.params.productId, updateActiveField, {new: true})
    .then(activateProduct => {

        if (!activateProduct) {

        	return res.status(404).send({ error: 'Product not found' });

        }

        return res.status(200).send({ 

        	message: 'Product activated successfully', 
        	activateProduct: activateProduct

        });
    }).catch(err => {

    	console.error("Error in activating a product: ", err);

    	return res.status(500).send({ error: "Internal Server Error" });

    });
};

