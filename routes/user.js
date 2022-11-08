import express from "express";
const router = express.Router();
import userController from "../controllers/user.js";
import isAuth from "../middleware/is-auth.js";

// User profile
router.get("/edit-profile/:id", isAuth, userController.getEditProfile);

// Cart
router.get("/cart", isAuth, userController.getCart);

router.post("/cart-add", isAuth, userController.postAddToCart);

router.post("/cart-delete", isAuth, userController.postDeleteFromCart);

router.get("/cart-clean", isAuth, userController.getCleanCart);

// Wishlist
router.get("/wishlist", isAuth, userController.getWishlist);

router.post("/wishlist-add", isAuth, userController.postAddToWishlist);

router.post("/wishlist-delete", isAuth, userController.postDeleteFromWishlist);

router.get("/wishlist-clean", isAuth, userController.getCleanWishlist);

// Orders
router.get("/checkout", isAuth, userController.getCheckout);

router.post("/checkout", isAuth, userController.postCheckout);

router.get("/orders", isAuth, userController.getUserOrders);

router.post("/delete-order", userController.postDeleteOrder);

export default router;