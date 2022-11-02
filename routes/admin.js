const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const storeController = require("../controllers/store");

router.get("/", adminController.showDashboard);

router.get("/create-product", storeController.getCreateProduct);

router.post("/create-product", storeController.postCreateProduct);

module.exports = router;