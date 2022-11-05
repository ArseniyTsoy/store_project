import User from "../models/User.js";
import bcrypt from "bcryptjs";
import transporter from "../util/mailer.js";

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
    console.log(err);
    res.redirect("/");
  });
}

// Reset password


export default {
  getSignup,
  postSignup,
  getLogin,
  postLogin,
  postLogout
};