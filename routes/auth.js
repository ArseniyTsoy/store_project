import express from "express";
const router = express.Router();

import authController from "../controllers/auth.js";
import User from "../models/User.js";
import { body } from "express-validator";

router.get("/signup", authController.getSignup);

router.post("/signup", [

    body(["name", "email", "password", "confirmPassword"], "Поле должно быть заполнено").exists({ checkNull: true, checkFalsy: true }),

    body("name", "Имя от 3 до 30 символов").isLength({ min: 3, max: 30 }).bail().trim(),

    body("email")
      .isEmail()
      .withMessage("Введите корректный E-Mail")
      .bail()
      .normalizeEmail()
      .custom(async (value) => {
        const [ rows ] = await User.findOne("email", value);
        if(rows[0]) {
          return Promise.reject("Данный E-Mail уже зарегистрирован");
        } else {
          return Promise.resolve();
        }
      }
    ),

    body("password", "Пароль должен быть от 5 до 30 символов и содержать только буквы и цифры").isLength({ min: 5, max: 30 }).isAlphanumeric(),

    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        return Promise.reject("Пароли не совпадают");
      } else {
        return Promise.resolve();
      }
    }),

    body("validateImage").custom((value, { req }) => {
      if (!req.file) {
        return Promise.reject(value);
      } else {
        return Promise.resolve();
      }
    })

  ],
  authController.postSignup
);

router.get("/login", authController.getLogin);

router.post(
  "/login", [

    body(["email", "password"], "Поле должно быть заполнено").exists({ checkNull: true, checkFalsy: true }),

    body("email")
      .isEmail()
      .withMessage("Введите корректный E-Mail")
      .bail()
      .normalizeEmail()
      .custom(async (value) => {
        const [ rows ] = await User.findOne("email", value);

        if(!rows[0]) {
          return Promise.reject("Пользователь с таким E-Mail не обнаружен");
        } else {
          return Promise.resolve();
        }
      }
    ),

    body("password", "Пароль должен быть от 5 до 30 символов и содержать только буквы и цифры").isLength({ min: 5, max: 30 }).isAlphanumeric()
    
  ],
  authController.postLogin
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getResetPassword);

router.post("/reset", [

    body("email")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage("Введите ваш E-Mail")
      .isEmail()
      .withMessage("Введите корректный E-Mail")
      .bail()
      .normalizeEmail()
      .custom(async (value) => {
        const [ rows ] = await User.findOne("email", value);

        if(!rows[0]) {
          return Promise.reject("E-Mail не найден");
        } else {
          return Promise.resolve();
        }
      }
    )
  ], 
  authController.postResetPassword
);

router.get("/new-password/:resetToken/:providedEmail", authController.getNewPassword);

router.post("/new-password", [

    body(["newPassword", "confirmPassword"], "Поле должно быть заполнено").exists({ checkNull: true, checkFalsy: true }),

    body("newPassword", "Пароль должен быть от 5 до 30 символов и содержать только буквы и цифры").isLength({ min: 5, max: 30 }).isAlphanumeric(),

    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        return Promise.reject("Пароли не совпадают");
      } else {
        return Promise.resolve();
      }
    })
    
  ], 
  authController.postNewPassword
);

export default router;