const Product = require("../models/Product");
const User = require("../models/User");

// Create product
function getCreateProduct(_, res) {
  return res.render("admin/create-product", {
    pageTitle: "Добавить новый товар",
  });
}

async function postCreateProduct(req, res) {
  const title = req.body.title;
  const category = req.body.category;
  const price = req.body.price;
  const imageUrl = req.file.path;
  const description = req.body.description;

  try {
    const newProduct = new Product(
      title,
      category,
      price,
      imageUrl,
      description
    );

    await newProduct.create();

    return res.redirect("/catalog");
  } catch (err) {
    throw new Error(err);
  }
}

// Administer user accounts
async function getUsers(_, res) {
  try {
    const rawUsersData = await User.findAll();
    const foundUsers = rawUsersData[0];

    const hasUsers = foundUsers ? true : false;

    return res.render("admin/users", {
      hasUsers,
      users: foundUsers
    });
  } catch(err) {
    throw new Error(err);
  }
}

async function postDeleteUser(req, res) {
  const userId = req.body.userId;

  try {
    const result = await User.deleteById(userId);
    
    if (result && result.length > 0) {
      return res.redirect("/admin/users");
    } else {
      throw new Error("Failed to delete the user!");
    }
  } catch(err) {
    throw new Error(err);
  }
}

// Admin dashboard
function getDashboard(_, res) {
  return res.render("admin/index", {
    pageTitle: "Панель администратора"
  });
}

module.exports = {
  getCreateProduct,
  postCreateProduct,
  getUsers,
  postDeleteUser,
  getDashboard
};