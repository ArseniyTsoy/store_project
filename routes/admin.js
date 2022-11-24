import express from "express";
import adminController from "../controllers/admin.js";
import { body } from "express-validator";
import isAuth from "../middleware/is-auth.js";
import isAdmin from "../middleware/is-admin.js";

const router = express.Router();

// Products
router.get("/create-product", isAuth, isAdmin, adminController.getCreateProduct);

router.post("/create-product", isAuth, isAdmin, 
  [

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

    body("image").custom((value, { req }) => {
      if (!req.file) {
        return Promise.reject("Добавьте изображение");
      } else {
        return Promise.resolve();
      }
    })

  ],
  adminController.postCreateProduct
);

router.get("/edit-product/:productId", isAuth, isAdmin, adminController.getEditProduct);

router.post("/edit-product", isAuth, isAdmin, 
  [

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

router.post("/remove-product", isAuth, isAdmin, adminController.postRemoveProduct);

router.get("/show-product/:productId", isAuth, isAdmin, adminController.getShowProduct);

router.get("/catalog", isAuth, isAdmin, adminController.getProducts);

// Categories
router.get("/create-category", isAuth, isAdmin, adminController.getCreateCategory);

router.post("/create-category", isAuth, isAdmin, 
  [

    body(["title", "description"], "Поле должно быть заполнено").exists({ checkNull: true, checkFalsy: true }),

    body("title", "Название от 3 до 30 символов").isLength({ min: 3, max: 30 }).bail().trim(),

    body("description", "Описание от 10 до 200 символов").isLength({ min: 10, max: 200 }).bail().trim(),

    body("image").custom((value, { req }) => {
      if (!req.file) {
        return Promise.reject("Добавьте изображение");
      } else {
        return Promise.resolve();
      }
    })

  ], 
  adminController.postCreateCategory
);

router.get("/edit-category/:catId", isAuth, isAdmin, adminController.getEditCategory);

router.post("/edit-category", isAuth, isAdmin, 
  [

    body(["title", "description"], "Поле должно быть заполнено").exists({ checkNull: true, checkFalsy: true }),

    body("title", "Название от 3 до 30 символов").isLength({ min: 3, max: 30 }).bail().trim(),

    body("description", "Описание от 10 до 200 символов").isLength({ min: 10, max: 200 }).bail().trim()

  ], 
  adminController.postEditCategory
);

router.post("/delete-category", isAuth, isAdmin, adminController.postDeleteCategory);

router.get("/categories", isAuth, isAdmin, adminController.getCategories);

// Users
router.get("/users", isAuth, isAdmin, adminController.getUsers);

router.post("/user-delete", isAuth, isAdmin, adminController.postDeleteUser);

// Orders
router.get("/orders", isAuth, isAdmin, adminController.getOrders);

router.post("/order-status", isAuth, isAdmin, adminController.postSetOrderStatus);

router.post("/delete-order", isAuth, isAdmin, adminController.postDeleteOrder);

// Dashboard
router.get("/", isAuth, isAdmin, adminController.getDashboard);

export default router;