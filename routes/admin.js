import express from "express";
const router = express.Router();
import adminController from "../controllers/admin.js";

// Create new product
router.get("/create-product", adminController.getCreateProduct);

router.post("/create-product", adminController.postCreateProduct);

// Create new category
router.get("/create-category", adminController.getCreateCategory);

router.post("/create-category", adminController.postCreateCategory);

// Users
router.get("/users", adminController.getUsers);

router.post("/user-delete", adminController.postDeleteUser);

// Orders
router.get("/orders", adminController.getOrders);

router.post("/delete-order", adminController.postDeleteOrder);

// Dashboard
router.get("/", adminController.getDashboard);

export default router;