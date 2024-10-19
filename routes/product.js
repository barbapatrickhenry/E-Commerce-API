const express = require("express");

const productController = require("../controllers/product");

const auth = require("../auth");

const { verify, verifyAdmin } = auth;

const router = express.Router();

router.post("/", verify, verifyAdmin, productController.addProduct);

router.get("/all", productController.getAllProducts);

router.get("/active", productController.getAllActive);

router.get("/:productId", productController.getProduct);

router.patch("/:productId", verify, verifyAdmin, productController.updateProduct);

router.patch("/archive/:productId/", verify, verifyAdmin, productController.archiveProduct);

router.patch("/activate/:productId/", verify, verifyAdmin, productController.activateProduct);

module.exports = router;
