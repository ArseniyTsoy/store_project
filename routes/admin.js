import express from "express";
const router = express.Router();
import adminController from "../controllers/admin.js";

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

export default router;