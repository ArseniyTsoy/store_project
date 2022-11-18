import express from "express";
const router = express.Router();
import authController from "../controllers/auth.js";
import User from "../models/User.js";
import { body } from "express-validator";
import bcrypt from "bcryptjs";
import equipError from "../utils/equipError.js";

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
        let rows;

        try {
          [ rows ] = await User.findByField("users", "email", value);
        } catch(err) {
          return Promise.reject("Техническая ошибка. Попробуйте снова");
        }

        if (rows[0]) {
          return Promise.reject("Данный E-Mail уже зарегистрирован");
        } else {
          return Promise.resolve();
        }
      }
    ),

    body("password")
      .isLength({ min: 8, max: 30 })
      .withMessage("От 8 до 30 символов")
      .isStrongPassword({  
        minUppercase: 0, 
        minNumbers: 1, 
        minSymbols: 1
      })
      .withMessage("Слабый пароль. Используйте буквы, цифры и символы"),

    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        return Promise.reject("Пароли не совпадают");
      } else {
        return Promise.resolve();
      }
    }),

    body("image").custom((value, { req }) => {
      if (!req.file) {
        return Promise.reject("Добавьте изображение");
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
        let rows;

        try {
          [ rows ] = await User.findByField("users", "email", value);
        } catch(err) {
          return Promise.reject("Техническая ошибка. Попробуйте снова");
        }

        if (!rows[0]) {
          return Promise.reject("Пользователь с таким E-Mail не обнаружен");
        } else {
          return Promise.resolve();
        }
      }
    ),

    body("password", "Пароль должен быть от 8 до 30 символов и содержать только буквы и цифры").isLength({ min: 8, max: 30 }),

    body("password").custom(async (value, { req }) => {
      
      let compareResult;

      try {
        const [ rows ] = await User.findByField("users", "email", req.body.email);
        const user = rows[0];

        compareResult = await bcrypt.compare(value, user.password);
      } catch(err) {
        equipError(err);
        return Promise.reject("Техническая ошибка. Попробуйте еще раз!"); 
      }

      if (!compareResult) {
        return Promise.reject("Неверный пароль!");
      } else {
        return Promise.resolve();
      }
    })
    
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
        let rows; 

        try {
          [ rows ] = await User.findByField("users", "email", value);
        } catch(err) {
          return Promise.reject("Техническая ошибка. Попробуйте снова");
        }

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

    body("newPassword")
      .isLength({ min: 8, max: 30 })
      .withMessage("От 8 до 30 символов")
      .isStrongPassword({  
        minUppercase: 0, 
        minNumbers: 1, 
        minSymbols: 1
      })
      .withMessage("Слабый пароль. Используйте буквы, цифры и символы"),

    body("confirmPassword").custom((value, { req }) => { 
      if (value !== req.body.newPassword) {
        return Promise.reject("Пароли не совпадают");
      } else {
        return Promise.resolve();
      }
    })
    
  ], 
  authController.postNewPassword
);

export default router;