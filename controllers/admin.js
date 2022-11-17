import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Category from "../models/Category.js";
import { validationResult } from "express-validator";
import equipError from "../utils/equipError.js";

// Products
async function getCreateProduct(req, res, next) {
  try {
    let categories = [];
    const [ rows ] = await Category.findAll("categories");

    for (let cat of rows) {
      categories.push({
        id: cat.id,
        title: cat.title
      });
    }

    return res.render("admin/products/create", {
      pageTitle: "Добавить новый товар",
      categories,
      hasError: false,
      errors: {}
    });
  } catch(err) {
    return next(equipError(err));
  }
}

async function postCreateProduct(req, res, next) {
  try {
    const { title, price, description }  = req.body;
    const categoryId = parseInt(req.body.categoryId);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

      const categories = JSON.parse(req.body.categories);

      return res.status(422).render("admin/products/create", {
        pageTitle: "Добавить новый товар",
        categories,
        hasError: true,
        oldInput: {
          title,
          price,
          description,
          categoryId
        },
        errors: errors.mapped()
      });
    }
    
    const imageUrl = req.file.path;

    const newProduct = new Product(
      null,
      title,
      price,
      imageUrl,
      description,
      categoryId
    );

    await newProduct.create();

    return res.status(201).redirect("/admin/catalog");
  } catch (err) {
    return next(equipError(err));
  }
}

async function getEditProduct(req, res, next) {
  try {
    const productId = req.params.productId;
    const [ rows ] = await Product.findById("products", productId);
    const product = rows[0];
    const hasProduct = product ? true : false;

    let categories = [];
    const [ results ] = await Category.findAll("categories");

    for (let cat of results) {
      categories.push({
        id: cat.id,
        title: cat.title
      });
    }

    return res.render("admin/products/edit", {
      pageTitle: "Редактирование товара",
      hasProduct,
      product,
      categories,
      errors: {}
    });
  } catch(err) {
    return next(equipError(err));
  }
}

async function postEditProduct(req, res, next) {
  const { id, title, price, description } = req.body;
  const categoryId = parseInt(req.body.categoryId);
  const imageUrl = req.file ? req.file.path : req.body.oldImageUrl;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const categories = JSON.parse(req.body.categories);

    return res.status(422).render("admin/products/edit", {
      pageTitle: "Редактирование товара",
      hasProduct: true,
      product: {
        id,
        title,
        price,
        imageUrl,
        description,
        categoryId        
      },
      categories,
      errors: errors.mapped()
    });
  }

  try {
    const [ rows ] = await Product.findById("products", id);

    const product = rows[0];

    if (!product) {
      throw new Error("Товар не обнаружен!");
    } 

    const editedProduct = new Product(id, title, price, imageUrl, description, categoryId);

    const result = await editedProduct.update();

    if (!result) {
      throw new Error("Product editing failed!");
    }

    return res.redirect("/admin/show-product/" + id);
  } catch(err) {
    return next(equipError(err));
  }
}

async function postRemoveProduct(req, res, next) {
  const productId = req.body.productId;

  try {
    const result = await Product.deleteById("products", productId);

    if (!result) {
      throw new Error("Deletion failed!");
    }

    return res.redirect("back");
  } catch(err) {
    return next(equipError(err));
  }
}

async function getShowProduct(req, res, next) {
  try {
    const productId = req.params.productId;

    const [ rows ] = await Product.findById("products", productId);
    const product = rows[0];

    const hasProduct = product ? true : false;

    const [ cats ] = await Category.findById("categories", product.categoryId);
    const category = cats[0].title;

    return res.render("admin/products/show", {
      pageTitle: "Быстрый просмотр/Админ",
      hasProduct,
      product,
      category
    });
  } catch(err) {
    return next(equipError(err));
  }
}

async function getProducts(req, res, next) {
  try {
    let products = null;
    let filteredBy = null;
    const catId = parseInt(req.query.catId);

    if (catId) {
      [ products ] = await Product.findByField("products", "categoryId", catId);
      filteredBy = catId;
    } else {
      [ products ] = await Product.findAll("products");
    }

    const hasProducts = (products && products.length > 0) ? true : false;

    let categories = [];
    const [ rows ] = await Category.findAll("categories");
    
    // Add check
    for (let item of rows) {
      categories.push({
        id: item.id,
        title: item.title
      });
    }

    const hasCategories = (categories.length > 0) ? true : false;

    return res.render("admin/products/all", {
      pageTitle: "Каталог/Админ",
      hasProducts,
      products,
      hasCategories,
      categories,
      filteredBy
    });
  } catch(err) {
    return next(equipError(err));
  }
}

// Categories
function getCreateCategory(req, res) {
  return res.render("admin/categories/form", {
    pageTitle: "Добавить новую категорию",
    edit: false,
    category: {},
    hasError: false,
    errors: {}
  });
}

async function postCreateCategory(req, res, next) {
  try {
    const { title, description } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("admin/categories/form", {
        pageTitle: "Добавить новую категорию",
        edit: false,
        hasError: true,
        category: {
          title, 
          description,
          // imageUrl
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

    return res.status(201).redirect("/admin/categories");
  } catch (err) {
    return next(equipError(err));
  }
}

async function getEditCategory(req, res, next) {
  try {
    const catId = req.params.catId;
    const [ rows ] = await Category.findById("categories", catId);
    const category = rows[0];

    return res.render("admin/categories/form", {
      pageTitle: "Редактировать категорию",
      edit: true,
      category,
      hasError: false,
      errors: {}
    });
  } catch(err) {
    return next(equipError(err));
  }
}

async function postEditCategory(req, res, next) {
  try {
    const { title, description, catId } = req.body;
    const imageUrl = req.file ? req.file.path : req.body.oldImageUrl;

    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(422).render("admin/categories/form", {
        pageTitle: "Редактировать категорию",
        edit: true,
        category: {
          title,
          description,
          imageUrl,
          catId
        },
        hasError: true,
        errors: errors.mapped()
      })
    }

    const editedCategory = new Category(catId, title, description, imageUrl);

    const result = await editedCategory.update();

    if (!result) {
      throw new Error("Failed to update category!");
    }

    // Show category
    return res.redirect("/admin/categories");
  } catch(err) {
    return next(equipError(err));
  }
}

async function postDeleteCategory(req, res, next) {
  try {
    const catId = req.body.catId;
    const result = await Category.deleteById("categories", catId);

    if (!result) {
      throw new Error("Failed to delete category!");
    }

    return res.redirect("back");
  } catch(err) {
    return next(equipError(err));
  }
}

async function getCategories(req, res, next) {
  try {
    const [ categories ] = await Category.findAll("categories");

    const hasCategories = (categories && categories.length > 0) ? true : false;

    return res.render("admin/categories/all", {
      pageTitle: "Категории/Админ",
      hasCategories,
      categories
    });
  } catch(err) {
    return next(equipError(err));
  }
}

// Administer user accounts
async function getUsers(req, res, next) {
  try {
    const [ users ] = await User.findAll("users");

    const hasUsers = users ? true : false;

    return res.render("admin/users", {
      hasUsers,
      users
    });
  } catch(err) {
    return next(equipError(err));
  }
}

async function postDeleteUser(req, res, next) {
  const userId = req.body.userId;

  try {
    const result = await User.deleteById("users", userId);
    
    if (result && result.length > 0) {
      return res.redirect("/admin/users");
    } else {
      throw new Error("Failed to delete the user!");
    }
  } catch(err) {
    return next(equipError(err));
  }
}

// Admin orders
async function getOrders(req, res, next) {
  try {
    let orders = null;
    let filteredBy = null;
    const status = req.query.status;

    if (status) {
      [ orders ] = await Order.findByField("orders", "status", status);
      filteredBy = status;
    } else {
      [ orders ] = await Order.findAll("orders");
    }

    const hasOrders = (orders && orders.length > 0) ? true : false;

    for (let order of orders) {
      order.address = JSON.parse(order.address);
      order.content = JSON.parse(order.content);
    }

    return res.render("admin/orders", {
      hasOrders,
      orders,
      filteredBy
    });

  } catch(err) {
    return next(equipError(err));
  }
}

async function postSetOrderStatus(req, res, next) {
  try {
    const order = new Order(req.body.orderId);
    const newStatus = req.body.orderStatus;

    const result = await order.setStatus(newStatus);

    if (!result) {

    }

    return res.redirect("back");
  } catch(err) {
    return next(equipError(err));
  }
}

async function postDeleteOrder(req, res, next) {
  const orderId = req.body.orderId;

  try {
    const result = await Order.deleteById("orders", orderId);

    if (!result) {
      throw new Error("Failed to delete the order!");
    }

    return res.redirect("back");
  } catch(err) {
    return next(equipError(err));
  }
}

// Admin dashboard
async function getDashboard(req, res) {
  let total = {};

  try {

    total.orders = await Order.count("orders");
    total.products = await Product.count("products");
    total.users = await User.count("users");
    total.categories = await Category.count("categories");

    return res.render("admin/index", {
      pageTitle: "Панель администратора",
      total
    });
  } catch(err) {
    return next(equipError(err));
  }
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
  postSetOrderStatus,
  postDeleteOrder,
  getDashboard
};