import express from "express";
const router = express.Router();
import userController from "../controllers/user.js";
import isAuth from "../middleware/is-auth.js";
import { body } from "express-validator";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

// User profile
router.get("/edit-profile/:id", isAuth, userController.getEditProfile);

router.post("/edit-profile", isAuth, [

    body(["name", "email", "oldPasswordConfirm", "newPassword", "newPasswordConfirm"], "Поле должно быть заполнено").exists({ checkNull: true, checkFalsy: true }),

    body("name", "Имя от 3 до 30 символов").isLength({ min: 3, max: 30 }).bail().trim(),

    body("email")
      .isEmail()
      .withMessage("Введите корректный E-Mail")
      .bail()
      .normalizeEmail()
      .custom(async (value, { req }) => {
        const [ rows ] = await User.findByField("users", "email", value);
        const user = rows[0];

        if(user && user.id !== req.session.user.id) {
          return Promise.reject("E-Mail уже зарегистрирован");
        } else {
          return Promise.resolve();
        }
      }
    ),

    body("oldPasswordConfirm").custom(async (value, { req }) => {
      const [ rows ] = await User.findById("users", req.body.id);
      const user = rows[0];
      const compareResult = await bcrypt.compare(value, user.password);

      if (!compareResult) {
        return Promise.reject("Неверный старый пароль");
      } else {
        return Promise.resolve();
      }
    }),

    body("newPassword")
      .isLength({ min: 8, max: 30 })
      .withMessage("От 8 до 30 символов")
      .isStrongPassword({  
        minUppercase: 0, 
        minNumbers: 1, 
        minSymbols: 1
      })
      .withMessage("Слабый пароль"),

    body("newPasswordConfirm").custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        return Promise.reject("Пароли не совпадают");
      } else {
        return Promise.resolve();
      }
    })

  ], 
  userController.postEditProfile
);

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

    body("method", "Выберите категорию").exists({ checkNull: true, checkFalsy: true }),

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