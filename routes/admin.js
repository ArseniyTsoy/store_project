import express from "express";
const router = express.Router();
import adminController from "../controllers/admin.js";

// Products
router.get("/create-product", adminController.getCreateProduct);

router.post("/create-product", adminController.postCreateProduct);

router.get("/edit-product/:productId", adminController.getEditProduct);

router.post("/edit-product", adminController.postEditProduct);

router.post("/remove-product", adminController.postRemoveProduct);

// Categories
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