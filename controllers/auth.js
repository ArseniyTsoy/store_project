import User from "../models/User.js";
import bcrypt from "bcryptjs";
import transporter from "../utils/mailer.js";
import crypto from "crypto";

// Signup
function getSignup(_, res) {
  return res.render("auth/form", {
    path: "/signup",
    pageTitle: "Регистрация",
    message: "Уже зарегистрированы?",
    buttonName: "войдите"
  });
}

async function postSignup(req, res) {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const imageUrl = req.file.path;

    const emailCheck = await User.findOne("email", email);

    if (emailCheck[0][0]) {
      throw new Error("E-Mail уже зарегистрирован! <a href='/user/password-reset'>Забыли пароль?</a>");
    }

    if (password !== confirmPassword) {
      throw new Error("Passwords don't match!");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User(null, name, email, imageUrl, hashedPassword);
    
    const result = await newUser.create();

    if (!result) {
      throw new Error("Failed to create a new account!");
    }

    await transporter.sendMail({
      from: process.env.MAIL_ADDR,
      to: email,
      subject: "Signup Succeeded! Регистрация прошла успешно!",
      // Сверстать темплате и сунуть в public
      html: `<h1>Congratulations!</h1>
        <p>You have successfully signed up!</p>
        <h1>Поздравляем!</h2>
        <p>Ваш аккаунт был успешно зарегистрирован!</p>`
    });

    return res.redirect("/auth/login");
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
    buttonName: "создайте аккаунт"
  });
}

async function postLogin(req, res, next) {
  try {
    const email = req.body.email;
    const providedPassword = req.body.password;
    const rawUser = await User.findOne("email", email);
    const processedUser = rawUser[0][0];

    if (!processedUser) {
      throw new Error("Пользователь с таким E-Mail не обнаружен");
    }

    const compareResult = await bcrypt.compare(providedPassword, processedUser.password);

    if (!compareResult) {
      throw new Error("Неверный пароль");
    }

    req.session.isAuthenticated = true;
    req.session.user = {
      id: processedUser.id,
      name: processedUser.name, 
      // email: processedUser.email, 
      imageUrl: processedUser.imageUrl
      // password: processedUser.password
    };

    const userForCounts = new User(processedUser.id);
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
    pageTitle: "Сброс пароля"
  });
}

async function postResetPassword(req, res) {
  const providedEmail = req.body.email;
  let resetToken;
  let resetTokenExpiration;

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }else {
      resetToken = buffer.toString("hex");
      resetTokenExpiration = Date.now() + 3600000;
    }
  });

  try {
    const rawUserData = await User.findOne("email", providedEmail);

    let user = rawUserData[0][0];

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
  const resetToken = req.params.resetToken;
  const providedEmail = req.params.providedEmail;

  try {
    const rawUserData = await User.findOne("email", providedEmail);

    const user = rawUserData[0][0];

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
      resetToken
    });
  } catch(err) {
    throw new Error(err);
  }
}

async function postNewPassword(req, res) {
  const { newPassword, confirmPassword, userId, resetToken } = req.body;

  try {
    if (newPassword !== confirmPassword) {
      throw new Error("Пароли не совпадают!");
    }

    const rawUserData = await User.findById(userId);
    let user = rawUserData[0][0];

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