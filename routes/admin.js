import express from "express";
const router = express.Router();
import adminController from "../controllers/admin.js";
import { body } from "express-validator";

// Products
router.get("/create-product", adminController.getCreateProduct);

router.post("/create-product", [

    body(["title", "price", "description"]).exists({ checkNull: true, checkFalsy: true }).withMessage("Поле должно быть заполнено"),

    body("title", "Название от 3 до 30 символов").isLength({ min: 3, max: 30 }).bail().trim(),

    body("price").isFloat().withMessage("Укажите стоимость в цифрах").bail().custom(value => {
      if (value < 0) {
        return Promise.reject("Стоимость не может быть меньше ноля");
      } else {
        return Promise.resolve();
      }
    }),

    body("description", "Описание от 10 до 200 символов").isLength({ min: 10, max: 200 }).bail().trim(),

  ],
  adminController.postCreateProduct
);

router.get("/edit-product/:productId", adminController.getEditProduct);

router.post("/edit-product", [

    body(["productTitle", "productPrice", "productDescription"]).exists({ checkNull: true, checkFalsy: true }).withMessage("Поле должно быть заполнено"),

    body("productTitle", "Название от 3 до 30 символов").isLength({ min: 3, max: 30 }).bail().trim(),

    body("productPrice").isFloat().withMessage("Укажите стоимость в цифрах").bail().custom(value => {
      if (value < 0) {
        return Promise.reject("Стоимость не может быть меньше ноля");
      } else {
        return Promise.resolve();
      }
    }),

    body("productDescription", "Описание от 10 до 200 символов").isLength({ min: 10, max: 200 }).bail().trim()
  ],
  adminController.postEditProduct
);

router.post("/remove-product", adminController.postRemoveProduct);

// Categories
router.get("/create-category", adminController.getCreateCategory);

router.post("/create-category", [

    body(["title", "description"]).exists({ checkNull: true, checkFalsy: true }).withMessage("Поле должно быть заполнено"),

    body("title", "Название от 3 до 30 символов").isLength({ min: 3, max: 30 }).bail().trim(),

    body("description", "Описание от 10 до 200 символов").isLength({ min: 10, max: 200 }).bail().trim()
    
  ], 
  adminController.postCreateCategory
);

// Users
router.get("/users", adminController.getUsers);

router.post("/user-delete", adminController.postDeleteUser);

// Orders
router.get("/orders", adminController.getOrders);

router.post("/delete-order", adminController.postDeleteOrder);

// Dashboard
router.get("/", adminController.getDashboard);

export default router;