import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Category from "../models/Category.js";
import { validationResult } from "express-validator";

// Products
function getCreateProduct(req, res) {
  return res.render("admin/create-product", {
    pageTitle: "Добавить новый товар",
    hasError: false,
    errors: {}
  });
}

async function postCreateProduct(req, res) {
  try {
    const { 
      title, 
      price, 
      description 
    }  = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("admin/create-product", {
        pageTitle: "Добавить новый товар",
        hasError: true,
        oldInput: {
          title: title,
          price: price,
          description: description
        },
        errors: errors.mapped()
      });
    }
    
    const imageUrl = req.file.path;
    const categoryId = req.body.categoryId;

    const newProduct = new Product(
      null,
      title,
      price,
      imageUrl,
      description,
      categoryId
    );

    await newProduct.create();

    return res.redirect("/admin/products");
  } catch (err) {
    throw new Error(err);
  }
}

async function getEditProduct(req, res) {
  const productId = req.params.productId;

  try {
    const [ rows ] = await Product.findById("products", productId);
    const product = rows[0];
    const hasProduct = product ? true : false;

    const [ categories ] = await Category.findAll("categories");

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
  const { 
    productId , 
    productTitle, 
    productPrice, 
    productCategoryId, 
    productDescription 
  } = req.body;

  const productImageUrl = req.file ? req.file.path : req.body.oldImageUrl;

  try {
    const [ rows ] = await Product.findById("products", productId);

    const product = rows[0];

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
    const result = await Product.deleteById("products", productId);

    if (!result) {
      throw new Error("Deletion failed!");
    }

    return res.redirect("back");
  } catch(err) {
    throw new Error(err);
  }
}

async function getShowProduct(req, res) {
  try {
    const productId = req.params.productId;

    const [ rows ] = await Product.findById("products", productId);
    const product = rows[0];

    const hasProduct = product ? true : false;

    const [ cats ] = await Category.findById("categories", product.categoryId);
    const category = cats[0].title;

    return res.render("admin/show-product", {
      pageTitle: "Быстрый просмотр/Админ",
      hasProduct,
      product,
      category
    });
  } catch(err) {
    throw new Error(err);
  }
}

async function getProducts(req, res) {
  try {
    const [ products ] = await Product.findAll("products");

    const hasProducts = (products && products.length > 0) ? true : false;

    let processedCategories = [];
    const [ categories ] = await Category.findAll("categories");
    
    // Add check
    for (let item of categories) {
      processedCategories.push({
        id: item.id,
        title: item.title
      });
    }

    return res.render("admin/products", {
      pageTitle: "Каталог/Админ",
      hasProducts,
      products,
      categories: processedCategories
    });
  } catch(err) {
    throw new Error(err);
  }
}

// Categories
function getCreateCategory(req, res) {
  return res.render("admin/form-category", {
    pageTitle: "Добавить новую категорию",
    edit: false,
    hasError: false,
    errors: {}
  });
}

async function postCreateCategory(req, res) {
  try {
    const { title, description } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("admin/form-category", {
        pageTitle: "Добавить новую категорию",
        edit: false,
        hasError: true,
        oldInput: {
          title, 
          description
        },
        errors: errors.mapped()
      });
    }

    const imageUrl = req.file.path;

    const newCategory = new Category(
      null,
      title,
      description,
      imageUrl
    );

    await newCategory.create();

    return res.redirect("/admin/categories");
  } catch (err) {
    throw new Error(err);
  }
}

async function getEditCategory(req, res) {
  try {
    const catId = req.params.catId;
    const [ rows ] = await Category.findById("categories", catId);
    const category = rows[0];

    const hasCategory = category ? true : false;

    return res.render("admin/form-category", {
      pageTitle: "Редактировать категорию",
      edit: true,
      hasCategory,
      category,
      hasError: false,
      errors: {}
    });
  } catch(err) {
    throw new Error(err);
  }
}

async function postEditCategory(req, res) {
  try {
    const updatedTitle = req.body.title; 
    const updatedDescription = req.body.description; 
    const catId = req.body.catId;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const [ rows ] = await Category.findById("categories", catId);
      const category = rows[0];

      const hasCategory = category ? true : false;

      return res.render("admin/form-category", {
        pageTitle: "Редактировать категорию",
        hasCategory,
        category,
        hasError,
        oldInput: {
          title: updatedTitle,
          description: updatedDescription
        },
        errors: errors.mapped()
      })
    }

    const updatedImageUrl = req.file.path;

    const updatedCategory = new Category(catId, updatedTitle, updatedDescription, updatedImageUrl);

    const result = await updatedCategory.update();

    if (!result) {
      throw new Error("Failed to update category!");
    }

    return res.redirect("/admin/categories");
  } catch(err) {
    throw new Error(err);
  }
}

async function postDeleteCategory(req, res) {
  try {
    const catId = req.body.catId;
    const result = await Category.deleteById("categories", catId);

    if (!result) {
      throw new Error("Failed to delete category!");
    }

    return res.redirect("back");
  } catch(err) {
    throw new Error(err);
  }
}

async function getCategories(req, res) {
  try {
    const [ categories ] = await Category.findAll("categories");

    const hasCategories = (categories && categories.length > 0) ? true : false;

    return res.render("admin/categories", {
      pageTitle: "Категории/Админ",
      hasCategories,
      categories
    });
  } catch(err) {
    throw new Error(err);
  }
}

// Administer user accounts
async function getUsers(req, res) {
  try {
    const [ users ] = await User.findAll("users");

    const hasUsers = users ? true : false;

    return res.render("admin/users", {
      hasUsers,
      users
    });
  } catch(err) {
    throw new Error(err);
  }
}

async function postDeleteUser(req, res) {
  const userId = req.body.userId;

  try {
    const result = await User.deleteById("users", userId);
    
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
    const [ orders ] = await Order.findAll("orders");

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
    const result = await Order.deleteById("orders", orderId);

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
async function getDashboard(req, res) {
  let total = {};

  total.orders = await Order.count("orders");
  total.products = await Product.count("products");
  total.users = await User.count("users");
  total.categories = await Category.count("categories");

  return res.render("admin/index", {
    pageTitle: "Панель администратора",
    total
  });
}

export default {
  getCreateProduct,
  postCreateProduct,
  getEditProduct,
  postEditProduct,
  postRemoveProduct,
  getShowProduct,
  getProducts,
  getCreateCategory,
  postCreateCategory,
  getEditCategory,
  postEditCategory,
  postDeleteCategory,
  getCategories,
  getUsers,
  postDeleteUser,
  getOrders,
  postDeleteOrder,
  getDashboard
};