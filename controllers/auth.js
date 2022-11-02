const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Signup
function getSignup(_, res) {
  res.render("auth/form", {
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

    if (password !== confirmPassword) {
      // Without return, the script execution will continue.
      // return res.redirect("/");
      throw new Error("Passwords don't match!");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User(name, email, hashedPassword, imageUrl);
    
    await newUser.save();
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

async function postLogin(req, res) {
  try {
    const email = req.body.email;
    const providedPassword = req.body.password;
    const rawUser = await User.findOne("email", email);

    if (!rawUser) {
      throw new Error("Пользователь с таким E-Mail не обнаружен");
    }

    const processedUser = rawUser[0][0];

    const compareResult = await bcrypt.compare(providedPassword, processedUser.password);

    if (!compareResult) {
      throw new Error("Неверный пароль");
    }

    // To the local variables of the req-res cycle
    req.session.isAuthenticated = true;
    req.session.user = {
      id: processedUser.id,
      name: processedUser.name,
      imageUrl: processedUser.imageUrl
    };
    req.session.cartItems = 0;
    req.session.wishlistItems = 0;
    
    return res.redirect("/");
  } catch(err) {
    throw new Error(err);
  }
}

// Logout
function postLogout(req, res) {
  return req.session.destroy(err => {
    console.log(err);
    res.redirect("/");
  });
}

module.exports = {
  getSignup,
  postSignup,
  getLogin,
  postLogin,
  postLogout
};