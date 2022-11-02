const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.js");
const isAuth = require("../middleware/is-auth");

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

module.exports = router;