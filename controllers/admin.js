import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Category from "../models/Category.js";
import { raw } from "express";

// Create product
async function getCreateProduct(req, res) {
  try {
    const rawProductsData = await Product.findAll();
    const products = rawProductsData[0];

    const hasProducts = (products && products.length > 0) ? true : false;

    let categories = [];
    const rawCategoriesData = await Category.findAll();
    
    // Add check
    for (let item of rawCategoriesData[0]) {
      categories.push({
        id: item.id,
        title: item.title
      });
    }

    return res.render("admin/create-product", {
      pageTitle: "Добавить новый товар",
      hasProducts,
      products,
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

    return res.redirect("back");
  } catch (err) {
    throw new Error(err);
  }
}

async function getEditProduct(req, res) {
  const productId = req.params.productId;

  try {
    const rawProductData = await Product.findById(productId);
    const product = rawProductData[0][0];
    const hasProduct = product ? true : false;

    const rawCategoriesData = await Category.findAll();
    const categories = rawCategoriesData[0] || [];

    return res.render("admin/edit-product", {
      pageTitle: "Редактирование товара",
      hasProduct,
      product,
      categories
    });
  } catch(err) {
    throw new Error(err);
  }
}

async function postEditProduct(req, res) {
  const { productId , productTitle, productPrice, productCategoryId, productDescription } = req.body;

  const productImageUrl = req.file ? req.file.path : req.body.oldImageUrl;

  try {
    const rawProductData = await Product.findById(productId);

    const product = rawProductData[0][0];

    if (!product) {
      throw new Error("Товар не обнаружен!");
    } 

    const editedProduct = new Product(
      productId , 
      productTitle, 
      productPrice, 
      productImageUrl, 
      productDescription, 
      productCategoryId
    );

    const result = await editedProduct.update();

    if (!result) {
      throw new Error("Product editing failed!");
    }

    return res.redirect(`/show-product/${productId}`);
  } catch(err) {
    throw new Error(err);
  }
}

async function postRemoveProduct(req, res) {
  const productId = req.body.productId;

  try {
    const result = await Product.deleteById(productId);

    if (!result) {
      throw new Error("Deletion failed!");
    }

    return res.redirect("back");
  } catch(err) {
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
  getEditProduct,
  postEditProduct,
  postRemoveProduct,
  getCreateCategory,
  postCreateCategory,
  getUsers,
  postDeleteUser,
  getOrders,
  postDeleteOrder,
  getDashboard
};