const express = require("express");
const router = express.Router();
const storeController = require("../controllers/store");

router.get("/about", storeController.getAbout);

router.get("/catalog", storeController.getCatalog);

router.get("/category", storeController.getCategory);

router.get("/search", storeController.getSearch);

router.post("/search", storeController.postSearch);

router.get("/show-product/:id", storeController.getSingleProduct);

router.get("/", storeController.getAllProducts);

module.exports = router;