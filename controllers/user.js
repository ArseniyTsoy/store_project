import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import equipError from "../utils/equipError.js";
import deleteFile from "../utils/deleteFile.js";

// User profile
async function getEditProfile(req, res, next) {
  try {
    const userId = parseInt(req.params.id);
    const currentUser = parseInt(req.session.user.id);

    if (userId !== currentUser) {
      throw new Error("Профили не совпадают")
    }

    const user = await User.findById(userId);

    const hasUser = user ? true: false;

    return res.render("user/edit-profile", {
      pageTitle: "Редактирование профиля",
      hasUser,
      user,
      hasError: false,
      errors: {}
    });
  } catch(err) {
    return next(equipError(err));
  }
}

async function postEditProfile(req, res, next) {
  try {
    const { id, name, email, password, oldImageUrl } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      if (req.file) {
        deleteFile(req.file.path);
      }

      return res.status(422).render("user/edit-profile", {
        pageTitle: "Редактирование профиля",
        hasUser: true,
        user: {
          id, 
          name, 
          email, 
          password,
          imageUrl: oldImageUrl
        },
        hasError: true,
        errors: errors.mapped()
      });
    }

    const imageUrl = req.file ? req.file.path : oldImageUrl;

    let editedUser = new User(id, name, email, imageUrl);

    if (req.body.newPassword) {
      editedUser.password = await bcrypt.hash(req.body.newPassword, 12);
    } else {
      editedUser.password = password;
    }

    editedUser.resetToken = null;
    editedUser.resetTokenExpiration = null;

    const result = await editedUser.update("users");

    if (!result) {
      throw new Error("Не удалось обновить профиль");
    }
    
    if (req.file) {
      deleteFile(oldImageUrl);
    }

    req.session.user = {
      id: editedUser.id,
      name: editedUser.name,
      imageUrl: editedUser.imageUrl
    };
    
    return res.redirect("/");
  } catch(err) {
    return next(equipError(err));
  }
}

// Cart
async function getCart(req, res, next) {
  try {
    const currentUser = new User(req.session.user.id);
    let totalSum = 0;
    
    const cart = await currentUser.getEverythingFrom("cart");

    const hasCart = (cart && cart.length > 0) ? true : false;

    for (let item of cart) {
      totalSum += item.price * item.quantity;
    }

    return res.render("user/cart", {
      pageTitle: "Корзина",
      hasCart,
      cart,
      totalSum
    });
  } catch(err) {
    return next(equipError(err));
  }
}

async function postAddToCart(req, res, next) {
  try {
    const userId = req.session.user.id;
    const productId = req.body.productId;
    const quantity = parseInt(req.body.qty);
    let alreadyIn = true;

    const productCheck = await Product.findById(productId);

    if (!productCheck) {
      throw new Error("Не удалось найти выбранный товар");
    }

    const product = new Product(productId);
    const newItemAdded = await product.addTo("cart", userId, quantity);

    if (newItemAdded) {
      ++req.session.cartItems;
      alreadyIn = false;
    }

    return res.status(200).json({
      itemsInCart: req.session.cartItems,
      alreadyIn
    });
  } catch(err) {
    return next(equipError(err));
  }
}

async function postChangeQty(req, res, next) {
  try {
    const newQty = req.body.qty;
    const product = new Product(req.body.productId);
    const userId = req.session.user.id;

    const result = await product.setQuantity(newQty, userId);

    if (!result) {
      throw new Error("Не удалось изменить число выбранного товара");
    }

    return res.redirect("back");
  } catch(err) {
    return next(equipError(err));
  }
}

async function postDeleteFromCart(req, res, next) {
  try {
    const product = new Product(req.body.itemId);  
    const result = await product.deleteFrom("cart");

    if (!result) {
      throw new Error("Не удалось удалить товар из корзины");
    }
    
    --req.session.cartItems;

    return res.redirect("/user/cart");
  } catch(err) {
    return next(equipError(err));
  }
}

async function getCleanCart(req, res, next) {
  try {
    const currentUser = new User(req.session.user.id);
    const result = await currentUser.clean("cart");

    if (!result) {
      throw new Error("Не удалось очистить корзину");
    }
    
    req.session.cartItems = 0;

    return res.redirect("/user/cart");
  } catch(err) {
    return next(equipError(err));
  }
}

// Wishlist
async function getWishlist(req, res, next) {
  try {
    // Pagination
    const currentUser = new User(req.session.user.id);
    const currentPage = parseInt(req.query.page) || 1;
    const limit = 3;
    const offset = currentPage > 1 ? limit * (currentPage - 1) : null;

    const wishlist = await currentUser.getEverythingFrom("wishlist", limit, offset);

    const totalItems = await currentUser.countItemsInside("wishlist");

    const hasItems = (wishlist && totalItems > 0) ? true : false;

    return res.render("user/wishlist", {
      pageTitle: "Список желаемого",
      hasItems,
      wishlist,
      // Pagination
      currentPage,
      hasNextPage: (limit * currentPage) < totalItems,
      hasPreviousPage: currentPage > 1,
      nextPage: currentPage + 1,
      previousPage: currentPage - 1,
      lastPage: Math.ceil(totalItems / limit)
    });
  } catch(err) {
    return next(equipError(err));
  }
}

async function postAddToWishlist(req, res, next) {
  try {
    const userId = req.session.user.id;
    const productId = req.body.productId;
    let alreadyIn = true;

    const productCheck = await Product.findById(productId);

    if (!productCheck) {
      throw new Error("Не удалось найти товар");
    }

    const product = new Product(productId);
    const newItemAdded = await product.addTo("wishlist", userId);

    if (newItemAdded) {
      ++req.session.wishlistItems;
      alreadyIn = false;
    }

    return res.status(200).json({
      itemsInWishlist: req.session.wishlistItems,
      alreadyIn
    });
  } catch(err) {
    return next(equipError(err));
  }
}

async function postDeleteFromWishlist(req, res, next) {
  try {
    const product = new Product(req.body.itemId);
    const result = await product.deleteFrom("wishlist");

    if (!result) {
      throw new Error("Не удалось удалить товар из списка желаемого");
    }
    
    --req.session.wishlistItems;

    return res.redirect("/user/wishlist");
  } catch(err) {
    return next(equipError(err));
  }
}

async function getCleanWishlist(req, res, next) {
  try {
    const currentUser = new User(req.session.user.id);
    const result = await currentUser.clean("wishlist");

    if (!result) {
      throw new Error("Не удалось очистить список");
    }
    
    req.session.wishlistItems = 0;

    return res.redirect("/user/wishlist");
  } catch(err) {
    return next(equipError(err));
  }
}

// Orders
async function getCheckout(req, res, next) {
  try {
    let cartHasItems = false;
    let orderContent = [];
    let totalPrice = 0;

    const currentUser = new User(req.session.user.id);
    const cart = await currentUser.getEverythingFrom("cart");

    if (cart && cart.length > 0) {
      cartHasItems = true;

      for (let item of cart) {
        orderContent.push({ 
          title: item.title, 
          price: item.price, 
          quantity: item.quantity 
        });
        totalPrice += item.quantity * item.price;
      }
    } else {
      cartHasItems = false;
    }

    return res.render("user/order-form", {
      pageTitle: "Оформление заказа",
      edit: false,
      cartHasItems,
      orderContent,
      totalPrice,
      hasError: false,
      errors: {}
    });
  } catch(err) {
    return next(equipError(err));
  }
}

async function postCreateOrder(req, res, next) {
  try {
    const { name, phone, email, method, country, city, street, house, flat, postalCode, totalPrice } = req.body;

    const orderContent = JSON.parse(req.body.orderContent);

    let address = { country, city, street, house, flat, postalCode };

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("user/order-form", {
        edit: false,
        cartHasItems: true,
        oldInput: { name, phone, email, method, address },
        orderContent,
        totalPrice, 
        hasError: true,
        errors: errors.mapped()
      });
    }

    const dateCreated = (new Date()).toLocaleDateString("ru", {
      year: "2-digit",
      month: "short",
      day: "numeric"
    });

    const currentUser = new User(req.session.user.id);

    const newOrder = new Order(null, currentUser.id, name, phone, email, method, address, orderContent, totalPrice, dateCreated);

    const result = await newOrder.create();

    if (!result) {
      throw new Error("Не удалось создать заказ");
    }

    await currentUser.clean("cart");
    req.session.cartItems = 0;
    
    return res.status(201).redirect("/user/orders");
  } catch(err) {
    return next(equipError(err));
  }
}

async function getEditOrder(req, res, next) {
  try {
    const orderId = parseInt(req.params.orderId);
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error("Не удалось найти выбранный заказ");
    }

    if (order.userId !== req.session.user.id) {
      throw new Error("Профили не совпадают");
    }

    order.address = JSON.parse(order.address);

    return res.render("user/order-form", {
      pageTitle: "Редактировать заказ",
      edit: true,
      order,
      hasError: false,
      errors: {}
    });
  } catch(err) {
    return next(equipError(err));
  }
}

async function postEditOrder(req, res, next) {
  try {
    const { orderId, name, phone, email, method, country, city, street, house, flat, postalCode } = req.body;

    let address = { country, city, street, house, flat, postalCode };

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("user/order-form", {
        pageTitle: "Редактировать заказ",
        edit: true,
        hasError: true,
        oldInput: { orderId, name, phone, email, method, address },
        errors: errors.mapped()
      });
    }

    address = JSON.stringify(address);
    const userId = req.session.user.id;

    const newOrder = new Order(orderId, userId, name, phone, email, method, address);

    const result = await newOrder.update();

    if (!result) {
      throw new Error("Не удалось обновить заказ");
    }

    return res.redirect("/user/orders");
  } catch(err) {
    return next(equipError(err));
  }
}

async function postDeleteOrder(req, res, next) {
  const orderId = req.body.orderId;

  try {
    const result = await Order.deleteById(orderId);

    if (!result) {
      throw new Error("Не удалось удалить заказ");
    }
    
    return res.render("messages/casual", {
      pageTitle: "Заказ отменен",
      outerLink: "https://freepik.com/free-vector/_8673474.htm#query=cancelled&position=12&from_view=search&track=sph",
      innerLink: "/images/service/order-cancelled.jpg",
      message: "Ваш заказ был успешно отменен"
    });
  } catch(err) {
    return next(equipError(err));
  } 
}

async function getUserOrders(req, res, next) {
  try {
    // Pagination
    const currentUser = req.session.user.id;
    const currentPage = parseInt(req.query.page) || 1;
    const limit = 3;
    const offset = currentPage > 1 ? limit * (currentPage - 1) : null;

    const orders = await Order.findByField("userId", currentUser, limit, offset);

    // To the User model (non-static)
    const totalOrders = await Order.countByField("userId", currentUser);

    const hasOrders = (orders && orders.length > 0) ? true : false;

    for (let order of orders) {
      order.address = JSON.parse(order.address);
      order.content = JSON.parse(order.content);
    }

    return res.render("user/orders", {
      pageTitle: "Ваши заказы",
      hasOrders,
      orders,
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

export default {
  getEditProfile,
  postEditProfile,
  getCart,
  postAddToCart,
  postChangeQty,
  postDeleteFromCart,
  getCleanCart,
  getWishlist,
  postAddToWishlist,
  postDeleteFromWishlist,
  getCleanWishlist,
  getCheckout,
  postCreateOrder,
  getEditOrder,
  postEditOrder,
  postDeleteOrder,
  getUserOrders
};