import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Category from "../models/Category.js";

// Create product
async function getCreateProduct(req, res) {
  try {
    let categories = [];
    const rawCategoriesData = await Category.findAll();
    
    for (let item of rawCategoriesData[0]) {
      categories.push({
        id: item.id,
        title: item.title
      });
    }

    return res.render("admin/create-product", {
      pageTitle: "Добавить новый товар",
      categories
    });
  } catch(err) {
    throw new Error(err);
  }
}

async function postCreateProduct(req, res) {
  const title = req.body.title;
  const categoryId = req.body.categoryId;
  const price = req.body.price;
  const imageUrl = req.file.path;
  const description = req.body.description;

  try {
    const newProduct = new Product(
      null,
      title,
      price,
      imageUrl,
      description,
      categoryId
    );

    await newProduct.create();

    return res.redirect("/catalog");
  } catch (err) {
    throw new Error(err);
  }
}

// Categories
function getCreateCategory(req, res) {
  return res.render("admin/create-category", {
    pageTitle: "Добавить новую категорию",
  });
}

async function postCreateCategory(req, res) {
  const { title, description } = req.body;
  const imageUrl = req.file.path;

  try {
    const newCategory = new Category(
      null,
      title,
      description,
      imageUrl
    );

    await newCategory.create();

    return res.redirect("/catalog");
  } catch (err) {
    throw new Error(err);
  }
}

// Administer user accounts
async function getUsers(req, res) {
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

// Admin orders
async function getOrders(req, res) {
  try {
    const rawOrdersData = await Order.findAll();
    const orders = rawOrdersData[0];

    const hasOrders = (orders && orders.length > 0) ? true : false;

    return res.render("admin/orders", {
      hasOrders,
      orders
    });
  } catch(err) {
    throw new Error(err);
  }
}

async function postDeleteOrder(req, res) {
  const orderId = req.body.orderId;

  try {
    const result = await Order.deleteById(orderId);

    if (!result) {
      throw new Error("Failed to delete the order!");
    }

    return res.render("utils/message", {
      pageTitle: "Заказ удален",
      message: "Выбранный вами заказ был успешно удален"
    });
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

export default {
  getCreateProduct,
  postCreateProduct,
  getCreateCategory,
  postCreateCategory,
  getUsers,
  postDeleteUser,
  getOrders,
  postDeleteOrder,
  getDashboard
};