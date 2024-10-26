const Product = require("../models/Product");

module.exports.addProduct = async (req, res) => {
    try {
        const { name, description, price, stock, picture } = req.body;

        const existingProduct = await Product.findOne({ name });

        if (existingProduct) {
            return res.status(409).send({ error: "Product already exists" });
        }

        const newProduct = new Product({
            name,
            description,
            price,
            stock,
            picture,
        });

        const savedProduct = await newProduct.save();
        return res.status(201).send(savedProduct);
    } catch (err) {
        console.error("Error in adding product:", err);
        return res.status(500).send({ error: "Failed to save the product" });
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

module.exports.getAllActive = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true });

        if (products.length > 0) {
            return res.status(200).send({ products });
        } else {
            return res.status(200).send({ message: "There are no products at the moment." });
        }
    } catch (err) {
        console.error("Error in finding active products: ", err);
        return res.status(500).send({ error: "Internal Server Error" });
    }
};


module.exports.getProduct = async (req, res) => {
    const productId = req.params.productId;

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }

        return res.status(200).send({ product });
    } catch (err) {
        console.error("Error in fetching the product: ", err);
        return res.status(500).send({ error: "Internal Server Error" });
    }
};


module.exports.updateProduct = async (req, res) => {
    const productId = req.params.productId;

    const updatedProduct = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        stock: req.body.stock,
        picture: req.body.picture,
    };

    try {
        const product = await Product.findByIdAndUpdate(productId, updatedProduct, { new: true });

        if (product) {
            return res.status(200).send({ 
                message: 'Product updated successfully',
                updatedProduct: product 
            });
        } else {
            return res.status(404).send({ error: 'Product not found' });
        }
    } catch (err) {
        console.error("Error in updating a product: ", err);
        return res.status(500).send({ error: "Internal Server Error" });
    }
};

module.exports.archiveProduct = async (req, res) => {
    const updateActiveField = {
        isActive: false,
    };

    try {
        const archiveProduct = await Product.findByIdAndUpdate(req.params.productId, updateActiveField, { new: true });

        if (!archiveProduct) {
            return res.status(404).send({ error: 'Product not found' });
        }

        return res.status(200).send({ 
            message: 'Product archived successfully', 
            archiveProduct: archiveProduct 
        });
    } catch (err) {
        console.error("Error in archiving a product: ", err);
        return res.status(500).send({ error: "Internal Server Error" });
    }
};


module.exports.activateProduct = async (req, res) => {
    const updateActiveField = {
        isActive: true,
    };

    try {
        const activateProduct = await Product.findByIdAndUpdate(req.params.productId, updateActiveField, { new: true });

        if (!activateProduct) {
            return res.status(404).send({ error: 'Product not found' });
        }

        return res.status(200).send({ 
            message: 'Product activated successfully', 
            activateProduct: activateProduct 
        });
    } catch (err) {
        console.error("Error in activating a product: ", err);
        return res.status(500).send({ error: "Internal Server Error" });
    }
};


module.exports.searchByName = async (req, res) => {

    try {
        console.log(req.body);
  
      const name = req.body.name;
  
      const products = await Product.find({
        name: { $regex: name, $options: "i" }
      });
  
      res.json(products);

    } catch (error) {

      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });

    }
};

module.exports.searchByPriceRange = async (req, res) => {

    try {
        console.log(req.body)
        
      const { minPrice, maxPrice } = req.body;

      if (!minPrice || !maxPrice) {
        return res.status(400).json({ error: 'Both minPrice and maxPrice are required in the request body.' });
      }

      const products = await Product.find({
        price: { $gte: minPrice, $lte: maxPrice }
      });

      res.json({ products });

    } catch (error) {

      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });

    }
};