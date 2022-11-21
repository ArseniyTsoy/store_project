import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Category from "../models/Category.js";
import { validationResult } from "express-validator";
import equipError from "../utils/equipError.js";
import deleteFile from "../utils/deleteFile.js";

// Products
async function getCreateProduct(req, res, next) {
  try {
    let categories = [];
    const rawCats = await Category.findAll();

    for (let cat of rawCats) {
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
      if (req.file) {
        deleteFile(req.file.path);
      }

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
    const product = await Product.findById(productId);
    const hasProduct = product ? true : false;

    let categories = [];
    const rawCats = await Category.findAll();

    for (let cat of rawCats) {
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
  const { id, title, price, description, oldImageUrl } = req.body;
  const categoryId = parseInt(req.body.categoryId);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    if (req.file) {
      deleteFile(req.file.path);
    }

    const categories = JSON.parse(req.body.categories);

    return res.status(422).render("admin/products/edit", {
      pageTitle: "Редактирование товара",
      hasProduct: true,
      product: {
        id,
        title,
        price,
        imageUrl: oldImageUrl,
        description,
        categoryId        
      },
      categories,
      errors: errors.mapped()
    });
  }

  const imageUrl = req.file ? req.file.path : oldImageUrl;

  try {
    const product = await Product.findById(id);

    if (!product) {
      throw new Error("Товар не обнаружен!");
    } 

    const editedProduct = new Product(id, title, price, imageUrl, description, categoryId);

    const result = await editedProduct.update();

    if (!result) {
      throw new Error("Product editing failed!");
    }

    if (req.file) {
      deleteFile(oldImageUrl);
    }

    return res.redirect("/admin/show-product/" + id);
  } catch(err) {
    return next(equipError(err));
  }
}

async function postRemoveProduct(req, res, next) {
  const { productId, imageUrl } = req.body;

  try {
    const result = await Product.deleteById(productId);

    if (!result) {
      throw new Error("Deletion failed!");
    }
    
    deleteFile(imageUrl);

    return res.redirect("/admin/catalog");
  } catch(err) {
    return next(equipError(err));
  }
}

async function getShowProduct(req, res, next) {
  try {
    const productId = req.params.productId;

    const product = await Product.findById(productId);

    const hasProduct = product ? true : false;

    const rawCat = await Category.findById(product.categoryId);
    const category = rawCat.title;

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
    let products;
    let totalProducts;

    const filteredBy = parseInt(req.query.filteredBy) || null;
    const currentPage = parseInt(req.query.page) || 1;
    const limit = 3;
    const offset = currentPage > 1 ? limit * (currentPage - 1) : null;

    if (filteredBy) {
      totalProducts = await Product.countByField("categoryId", filteredBy);

      products = await Product.findByField("categoryId", filteredBy, limit, offset);

    } else {
      totalProducts = await Product.count();
      
      products = await Product.findAll(limit, offset);
    }

    const hasProducts = (products && products.length > 0) ? true : false;

    let categories = [];
    const rawCats = await Category.findAll();
    
    // Add check
    for (let item of rawCats) {
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
      filteredBy,
      // Pagination
      currentPage,
      hasNextPage: (limit * currentPage) < totalProducts,
      hasPreviousPage: currentPage > 1,
      nextPage: currentPage + 1,
      previousPage: currentPage - 1,
      lastPage: Math.ceil(totalProducts / limit)
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
      if (req.file) {
        deleteFile(req.file.path);
      }

      return res.status(422).render("admin/categories/form", {
        pageTitle: "Добавить новую категорию",
        edit: false,
        hasError: true,
        category: {
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

    return res.status(201).redirect("/admin/categories");
  } catch (err) {
    return next(equipError(err));
  }
}

async function getEditCategory(req, res, next) {
  try {
    const catId = req.params.catId;
    const category = await Category.findById(catId);

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
    const { title, description, catId, oldImageUrl } = req.body;

    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      if (req.file) {
        deleteFile(req.file.path);
      }

      return res.status(422).render("admin/categories/form", {
        pageTitle: "Редактировать категорию",
        edit: true,
        category: {
          title,
          description,
          imageUrl: oldImageUrl,
          id: catId
        },
        hasError: true,
        errors: errors.mapped()
      })
    }

    const imageUrl = req.file ? req.file.path : oldImageUrl;

    const editedCategory = new Category(catId, title, description, imageUrl);

    const result = await editedCategory.update();

    if (!result) {
      throw new Error("Failed to update category!");
    }

    if (req.file) {
      deleteFile(oldImageUrl);
    }

    // Show category
    return res.redirect("/admin/categories");
  } catch(err) {
    return next(equipError(err));
  }
}

async function postDeleteCategory(req, res, next) {
  try {
    const { catId, imageUrl } = req.body;
    const result = await Category.deleteById(catId);

    if (!result) {
      throw new Error("Failed to delete category!");
    }

    deleteFile(imageUrl);

    return res.redirect("back");
  } catch(err) {
    return next(equipError(err));
  }
}

async function getCategories(req, res, next) {
  try {
    const currentPage = parseInt(req.query.page) || 1;
    const limit = 3;
    const offset = currentPage > 1 ? limit * (currentPage - 1) : null;
    
    const totalCats = await Category.count();

    const categories = await Category.findAll(limit, offset);

    const hasCategories = (categories && categories.length > 0) ? true : false;

    return res.render("admin/categories/all", {
      pageTitle: "Категории/Админ",
      hasCategories,
      categories,
      // Pagination
      currentPage,
      hasNextPage: (limit * currentPage) < totalCats,
      hasPreviousPage: currentPage > 1,
      nextPage: currentPage + 1,
      previousPage: currentPage - 1,
      lastPage: Math.ceil(totalCats / limit)
    });
  } catch(err) {
    return next(equipError(err));
  }
}

// Administer user accounts
async function getUsers(req, res, next) {
  try {
    const currentPage = parseInt(req.query.page) || 1;
    const limit = 3;
    const offset = currentPage > 1 ? limit * (currentPage - 1) : null;

    const totalUsers = await User.count();

    const users = await User.findAll(limit, offset);

    const hasUsers = users ? true : false;

    return res.render("admin/users", {
      pageTitle: "Зарегистрированные пользователи",
      hasUsers,
      users,
      // Pagination
      currentPage,
      hasNextPage: (limit * currentPage) < totalUsers,
      hasPreviousPage: currentPage > 1,
      nextPage: currentPage + 1,
      previousPage: currentPage - 1,
      lastPage: Math.ceil(totalUsers / limit)
    });
  } catch(err) {
    return next(equipError(err));
  }
}

async function postDeleteUser(req, res, next) {
  const { userId, imageUrl } = req.body;

  try {
    const result = await User.deleteById(userId);
    
    if (result && result.length > 0) {
      deleteFile(imageUrl);
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
    let orders;
    let totalOrders;
    
    const filteredBy = req.query.filteredBy || null;
    const currentPage = parseInt(req.query.page) || 1;
    const limit = 3;
    const offset = currentPage > 1 ? limit * (currentPage - 1) : null;

    if (filteredBy) {
      orders = await Order.findByField("status", filteredBy, limit, offset);
      
      totalOrders = await Order.countByField("status", filteredBy);
    } else {
      orders = await Order.findAll(limit, offset);

      totalOrders = await Order.count();
    }

    const hasOrders = (orders && orders.length > 0) ? true : false;

    for (let order of orders) {
      order.address = JSON.parse(order.address);
      order.content = JSON.parse(order.content);
    }

    return res.render("admin/orders", {
      pageTitle: "Заказы",
      hasOrders,
      orders,
      filteredBy,
      // Pagination
      currentPage,
      hasNextPage: (limit * currentPage) < totalOrders,
      hasPreviousPage: currentPage > 1,
      nextPage: currentPage + 1,
      previousPage: currentPage - 1,
      lastPage: Math.ceil(totalOrders / limit)
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
    const result = await Order.deleteById(orderId);

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

    total.orders = await Order.count();
    total.products = await Product.count();
    total.users = await User.count();
    total.categories = await Category.count();

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