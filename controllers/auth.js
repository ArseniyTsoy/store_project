import User from "../models/User.js";
import bcrypt from "bcryptjs";
import transporter from "../utils/mailer.js";
import crypto from "crypto";
import { validationResult } from "express-validator";

// Signup
function getSignup(_, res) {
  return res.render("auth/form", {
    path: "/signup",
    pageTitle: "Регистрация",
    message: "Уже зарегистрированы?",
    buttonName: "войдите",
    hasError: false,
    errors: {}
  });
}

async function postSignup(req, res) {
  try {
    const { name, email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("auth/form", {
        path: "/signup",
        pageTitle: "Регистрация",
        message: "Уже зарегистрированы?",
        buttonName: "войдите",
        hasError: true,
        oldInput: {
          name,
          email
        },
        errors: errors.mapped()
      });
    }

    const imageUrl = req.file.path;
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User(null, name, email, imageUrl, hashedPassword);
    
    const result = await newUser.create();

    // Нужна ли эта проверка при try-catch?
    if (!result) {
      throw new Error("Failed to create a new account!");
    }

    res.redirect("/auth/login");

    return transporter.sendMail({
      from: process.env.MAIL_ADDR,
      to: email,
      subject: "Signup Succeeded! Регистрация прошла успешно!",
      // Сверстать темплате и сунуть в public
      html: `<h1>Congratulations!</h1>
        <p>You have successfully signed up!</p>
        <h1>Поздравляем!</h2>
        <p>Ваш аккаунт был успешно зарегистрирован!</p>`
    });
  } catch(err) {
    throw new Error(err);
  }
}

// Login
function getLogin(_, res) {
  res.render("auth/form", {
    path: "/login",
    pageTitle: "Авторизация",
    message: "Не зарегистрированы?",
    buttonName: "создайте аккаунт",
    hasError: false,
    errors: {}
  });
}

async function postLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("auth/form", {
        path: "/login",
        pageTitle: "Авторизация",
        message: "Не зарегистрированы?",
        buttonName: "создайте аккаунт",
        hasError: true,
        oldInput: {
          email
        },
        errors: errors.mapped()
      });
    }

    const [ rows ] = await User.findOne("email", email);
    const user = rows[0];

    const compareResult = await bcrypt.compare(password, user.password);

    if (!compareResult) {
      throw new Error("Неверный пароль");
    }

    req.session.isAuthenticated = true;
    req.session.user = {
      id: user.id,
      name: user.name,
      imageUrl: user.imageUrl
    };

    if (user.user_type === "admin") {
      req.session.isAdmin = true;
    }

    const userForCounts = new User(user.id);
    const cartItems = await userForCounts.countCart();
    req.session.cartItems = (cartItems[0][0])["COUNT (*)"];
    const wishlistItems = await userForCounts.countWishlist();
    req.session.wishlistItems = (wishlistItems[0][0])["COUNT (*)"];

    return res.redirect("/");
  } catch(err) {
    return next(err);
  }
}

// Logout
function postLogout(req, res) {
  return req.session.destroy(err => {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
}

// Reset password
function getResetPassword(req, res) {
  return res.render("auth/reset", {
    pageTitle: "Сброс пароля",
    errors: {}
  });
}

async function postResetPassword(req, res) {
  try {
    const providedEmail = req.body.email;
    let resetToken;
    let resetTokenExpiration;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("auth/reset", {
        pageTitle: "Сброс пароля",
        providedEmail,
        errors: errors.mapped()
      });
    }

    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        console.log(err);
        return res.redirect("/reset");
      }else {
        resetToken = buffer.toString("hex");
        resetTokenExpiration = Date.now() + 3600000;
      }
    });

    const [rows] = await User.findOne("email", providedEmail);

    let user = rows[0];

    if (!user) {
      throw new Error("Пользователь не обнаружен!");
    }

    const { id, name, email, imageUrl, password } = user;
    user = new User(id, name, email, imageUrl, password);

    user.resetToken = resetToken;
    user.resetTokenExpiration = resetTokenExpiration;

    const saveResult = await user.updateAll();

    // Better check
    if (!saveResult) {
      throw new Error("Saving token failed!");
    }

    const sendMailCheck = await transporter.sendMail({
      from: process.env.MAIL_ADDR,
      to: providedEmail,
      subject: "Ссылка для изменения пароля!",
      // Сверстать темплате и сунуть в public
      html: `<h3>Вы запросили сброс пароля!</h3>
        <p>Пожалуйста, перейдите по этой <a href="http://localhost:8080/auth/new-password/${resetToken}/${providedEmail}">ссылке</a>, чтобы изменить пароль. Если сброс пароля был запрошен не вами, просто проигнорируйте данное сообщение.</p>`
    });

    // Better check
    if (!sendMailCheck) {
      throw new Error("Не удалось выслать письмо!");
    }

    return res.render("utils/message", {
      pageTitle: "Проверьте вашу почту",
      message: `На указанный вами адрес ${providedEmail} было выслано сообщение. Пожалуйста, проверьте вашу почту`
    });
  } catch(err) {
    throw new Error(err);
  }
}

async function getNewPassword(req, res) {
  try {
    const { resetToken, providedEmail } = req.params;
    const [rows] = await User.findOne("email", providedEmail);

    const user = rows[0];

    if (!user) {
      throw new Error("User wasn't found!");
    }

    if (user.resetToken !== resetToken) {
      throw new Error("Reset tokens don't match!");
    }

    if (user.resetTokenExpiration <= Date.now()) {
      throw new Error("Token is expired!");
    }

    return res.render("auth/new-password", {
      pageTitle: "Новый пароль",
      userId: user.id,
      resetToken,
      errors: {}
    });
  } catch(err) {
    throw new Error(err);
  }
}

async function postNewPassword(req, res) {
  try {
    const { newPassword, userId, resetToken } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("auth/new-password", {
        pageTitle: "Новый пароль",
        userId,
        resetToken,
        errors: errors.mapped()
      });
    }

    const [rows] = await User.findById(userId);
    let user = rows[0];

    if (!user) {
      throw new Error("Пользователь не найден!");
    }

    if (user.resetToken !== resetToken) {
      throw new Error("Tokens do not match!");
    }
    
    if (user.resetTokenExpiration <= Date.now()) {
      throw new Error("Token is expired!");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    const { id, name, email, imageUrl } = user;

    const updatedUser = new User(id, name, email, imageUrl);

    updatedUser.password = hashedNewPassword;
    updatedUser.resetToken = null;
    updatedUser.resetTokenExpiration = null;

    const result = await updatedUser.updateAll();

    if (!result) {
      throw new Error("Не удалось изменить пароль!");
    }

    return res.render("utils/message", {
      pageTitle: "Пароль успешно изменен",
      message: "Ваш пароль был успешно изменен"
    })
  } catch(err) {
    throw new Error(err);
  }
}

export default {
  getSignup,
  postSignup,
  getLogin,
  postLogin,
  postLogout,
  getResetPassword,
  postResetPassword,
  getNewPassword,
  postNewPassword
};