const express = require("express");
const router = express.Router();
const productsController = require("../controllers/products");

router.get("/create-product", productsController.offerCreateProduct);

router.post("/create-product", productsController.createProduct);

router.get("/show_product", productsController.showProduct);

router.get("/", productsController.showAll);

module.exports = router;