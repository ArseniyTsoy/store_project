import express from "express";
const router = express.Router();
import adminController from "../controllers/admin.js";
import { body } from "express-validator";

// Products
router.get("/create-product", adminController.getCreateProduct);

router.post("/create-product", [

    body(["title", "price", "description"]).exists({ checkNull: true, checkFalsy: true }).withMessage("Поле должно быть заполнено"),

    body("categoryId").exists({ checkNull: true, checkFalsy: true }).withMessage("Категория не выбрана"),

    body("title", "Название от 3 до 30 символов").isLength({ min: 3, max: 30 }).bail().trim(),

    body("price").isFloat().withMessage("Укажите стоимость в цифрах").bail().custom(value => {
      if (value < 0) {
        return Promise.reject("Стоимость не может быть меньше ноля");
      } else {
        return Promise.resolve();
      }
    }),

    body("description", "Описание от 10 до 200 символов").isLength({ min: 10, max: 200 }).bail().trim(),

    body("validateImage").custom((value, { req }) => {
      if (!req.file) {
        return Promise.reject(value);
      } else {
        return Promise.resolve();
      }
    })

  ],
  adminController.postCreateProduct
);

router.get("/edit-product/:productId", adminController.getEditProduct);

router.post("/edit-product", [

    body(["title", "price", "description"], "Поле должно быть заполнено").exists({ checkNull: true, checkFalsy: true }),

    body("title", "Название от 3 до 30 символов").isLength({ min: 3, max: 30 }).bail().trim(),

    body("price").isFloat().withMessage("Укажите стоимость в цифрах").bail().custom(value => {
      if (value < 0) {
        return Promise.reject("Стоимость не может быть меньше ноля");
      } else {
        return Promise.resolve();
      }
    }),

    body("description", "Описание от 10 до 200 символов").isLength({ min: 10, max: 200 }).bail().trim()
  ],
  adminController.postEditProduct
);

router.post("/remove-product", adminController.postRemoveProduct);

router.get("/show-product/:productId", adminController.getShowProduct);

router.get("/catalog", adminController.getProducts);

// Categories
router.get("/create-category", adminController.getCreateCategory);

router.post("/create-category", [

    body(["title", "description"], "Поле должно быть заполнено").exists({ checkNull: true, checkFalsy: true }),

    body("title", "Название от 3 до 30 символов").isLength({ min: 3, max: 30 }).bail().trim(),

    body("description", "Описание от 10 до 200 символов").isLength({ min: 10, max: 200 }).bail().trim(),

    body("validateImage").custom((value, { req }) => {
      if (!req.file) {
        return Promise.reject(value);
      } else {
        return Promise.resolve();
      }
    })
  ], 
  adminController.postCreateCategory
);

router.get("/edit-category/:catId", adminController.getEditCategory);

router.post("/edit-category", [

    body(["title", "description"], "Поле должно быть заполнено").exists({ checkNull: true, checkFalsy: true }),

    body("title", "Название от 3 до 30 символов").isLength({ min: 3, max: 30 }).bail().trim(),

    body("description", "Описание от 10 до 200 символов").isLength({ min: 10, max: 200 }).bail().trim()

  ], 
  adminController.postEditCategory
);

router.post("/delete-category", adminController.postDeleteCategory);

router.get("/categories", adminController.getCategories);

// Users
router.get("/users", adminController.getUsers);

router.post("/user-delete", adminController.postDeleteUser);

// Orders
router.get("/orders", adminController.getOrders);

router.post("/order-status", adminController.postSetOrderStatus);

router.post("/delete-order", adminController.postDeleteOrder);

// Dashboard
router.get("/", adminController.getDashboard);

export default router;