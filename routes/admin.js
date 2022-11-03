const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");

// Create new product
router.get("/create-product", adminController.getCreateProduct);

router.post("/create-product", adminController.postCreateProduct);

// Users
router.get("/users", adminController.getUsers);

router.post("/user-delete", adminController.postDeleteUser);

// Orders
router.get("/orders", adminController.getOrders);

// Dashboard
router.get("/", adminController.getDashboard);

module.exports = router;