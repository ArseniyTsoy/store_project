import User from "../models/User.js";
import bcrypt from "bcryptjs";
import transporter from "../utils/mailer.js";
import crypto from "crypto";
import { validationResult } from "express-validator";
import equipError from "../utils/equipError.js";

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

async function postSignup(req, res, next) {
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
    
    const result = await newUser.create("users");

    // Нужна ли эта проверка при try-catch?
    if (!result) {
      throw new Error("Failed to create a new account!");
    }

    res.status(201).redirect("/auth/login");

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
    return next(equipError(err));
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

    const [ rows ] = await User.findByField("users", "email", email);
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

    if (user.userType === "admin") {
      req.session.isAdmin = true;
    }

    const userForCounts = new User(user.id);
    const cartItems = await userForCounts.countItemsInside("cart");
    req.session.cartItems = (cartItems[0][0])["COUNT (*)"];
    const wishlistItems = await userForCounts.countItemsInside("wishlist");
    req.session.wishlistItems = (wishlistItems[0][0])["COUNT (*)"];

    return res.redirect("/");
  } catch(err) {
    next(err);
  }
}

// Logout
function postLogout(req, res, next) {
  return req.session.destroy(err => {
    if (err) {
      return next(equipError(err));
    } else {
      return res.redirect("/");
    }
  });
}

// Reset password
function getResetPassword(req, res) {
  return res.render("auth/reset", {
    pageTitle: "Сброс пароля",
    errors: {}
  });
}

async function postResetPassword(req, res, next) {
  try {
    const providedEmail = req.body.email;
    let resetToken;
    let resetTokenExpiration;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("auth/reset", {
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

    const [rows] = await User.findByField("users", "email", providedEmail);

    let user = rows[0];

    if (!user) {
      throw new Error("Пользователь не обнаружен!");
    }

    const { id, name, email, imageUrl, password } = user;
    user = new User(id, name, email, imageUrl, password);

    user.resetToken = resetToken;
    user.resetTokenExpiration = resetTokenExpiration;

    const saveResult = await user.update();

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

    return res.render("messages/casual", {
      pageTitle: "Проверьте вашу почту",
      outerLink: "https://www.freepik.com/free-vector/message-sent-concept-illustration_9936445.htm#query=email%20sent&position=1&from_view=search&track=sph",
      innerLink: "/images/service/email.jpg",
      message: `На указанный адрес ${providedEmail} было выслано сообщение. Пожалуйста, проверьте вашу почту`
    });
  } catch(err) {
    return next(equipError(err));
  }
}

async function getNewPassword(req, res, next) {
  try {
    const { resetToken, providedEmail } = req.params;
    const [rows] = await User.findByField("users", "email", providedEmail);

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
    return next(equipError(err));
  }
}

async function postNewPassword(req, res, next) {
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

    const [rows] = await User.findById("users", userId);
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

    const result = await updatedUser.update();

    // Заменить на валидацию
    if (!result) {
      throw new Error("Не удалось изменить пароль!");
    }

    return res.render("messages/casual", {
      pageTitle: "Пароль успешно изменен",
      outerLink: "https://www.freepik.com/free-vector/account-concept-illustration_5464649.htm#page=2&position=42&from_view=author",
      innerLink: "/images/service/password-changed.jpg",
      message: "Ваш пароль был успешно изменен"
    })
  } catch(err) {
    return next(equipError(err));
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