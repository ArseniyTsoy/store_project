import express from "express";
const router = express.Router();
import userController from "../controllers/user.js";
import isAuth from "../middleware/is-auth.js";
import { body } from "express-validator";

// User profile
router.get("/edit-profile/:id", isAuth, userController.getEditProfile);
// Валидатор под POST

// Cart
router.get("/cart", isAuth, userController.getCart);

router.post("/cart-add", isAuth, userController.postAddToCart);

router.post("/change-qty", isAuth, userController.postChangeQty);

router.post("/cart-delete", isAuth, userController.postDeleteFromCart);

router.get("/cart-clean", isAuth, userController.getCleanCart);

// Wishlist
router.get("/wishlist", isAuth, userController.getWishlist);

router.post("/wishlist-add", isAuth, userController.postAddToWishlist);

router.post("/wishlist-delete", isAuth, userController.postDeleteFromWishlist);

router.get("/wishlist-clean", isAuth, userController.getCleanWishlist);

// Orders
router.get("/checkout", isAuth, userController.getCheckout);

router.post("/checkout", [

    body(["name", "phone", "email", "country", "city", "street", "house", "flat", "postalCode"]).exists({ checkNull: true, checkFalsy: true }).withMessage("Поле должно быть заполнено"),

    body("phone", "Укажите корректный номер телефона").isNumeric().isMobilePhone("any"),

    body("email").isEmail().withMessage("Введите корректный E-Mail").normalizeEmail(),

    body(["house", "flat"], "Укажите номер в цифрах").isNumeric(),

    body("postalCode", "Укажите корректный индекс").isPostalCode("any")

  ],
  isAuth, userController.postCheckout
);

router.get("/orders", isAuth, userController.getUserOrders);

router.post("/delete-order", userController.postDeleteOrder);

export default router;