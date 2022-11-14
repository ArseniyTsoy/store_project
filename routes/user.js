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

router.post("/create-order", [

    body(["name", "phone", "email", "country", "city", "street", "house", "flat", "postalCode"], "Поле должно быть заполнено").exists({ checkNull: true, checkFalsy: true }),

    body("phone", "Укажите корректный номер телефона").isMobilePhone("any"),

    body("email").isEmail().withMessage("Введите корректный E-Mail").bail().normalizeEmail(),

    body("flat", "Укажите номер в цифрах").isNumeric(),

    body("postalCode", "Укажите корректный индекс").isPostalCode("any")

  ],
  isAuth, userController.postCreateOrder
);

router.get("/edit-order/:orderId", userController.getEditOrder);

router.post("/edit-order", [

    body(["name", "phone", "email", "country", "city", "street", "house", "flat", "postalCode"], "Поле должно быть заполнено").exists({ checkNull: true, checkFalsy: true }),

    body("phone", "Укажите корректный номер телефона").isMobilePhone("any"),

    body("email").isEmail().withMessage("Введите корректный E-Mail").bail().normalizeEmail(),

    body("flat", "Укажите номер в цифрах").isNumeric(),

    body("postalCode", "Укажите корректный индекс").isPostalCode("any")

  ],
  isAuth, userController.postEditOrder
);

router.post("/delete-order", userController.postDeleteOrder);

router.get("/orders", isAuth, userController.getUserOrders);

export default router;