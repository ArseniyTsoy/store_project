import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { validationResult } from "express-validator";

// User profile
async function getEditProfile(req, res) {
  const userId = req.params.id;

  try {
    const rawUser = await User.findById(userId);

    if (!rawUser) {
      throw new Error("No user found!");
    }

    const processedUser = rawUser[0][0];

    res.render("user/edit-profile", {
      pageTitle: "Редактирование профиля",
      user: processedUser
    });
  } catch(err) {
    throw new Error(err);
  }
}

async function postEditProfile(req, res) {
  const userId = req.params.userId;
  const updatedTitle = req.body.title;
  const updatedEmail = req.body.email;
  const image = req.file;
}

// Cart
async function getCart(req, res) {
  const currentUser = new User(req.session.user.id);

  try {
    const rawCartData = await currentUser.getEverythingFrom("cart");
    const cart = rawCartData[0];

    const hasCart = (cart && cart.length > 0) ? true : false;

    return res.render("user/cart", {
      pageTitle: "Корзина",
      hasCart,
      cart
    });
  } catch(err) {
    throw new Error(err);
  }
}

async function postAddToCart(req, res) {
  const userId = req.session.user.id;
  const productId = req.body.productId;
  const quantity = +req.body.qty;

  try {
    const productCheck = await Product.findById("products", productId);

    if (!productCheck) {
      throw new Error("Product isn't found!");
    }

    const product = new Product(productId);
    const newItemAdded = await product.addTo("cart", userId, quantity);

    if (newItemAdded) {
      ++req.session.cartItems;
    }

    return res.redirect("back");
  } catch(err) {
    throw new Error(err);
  }
}

async function postChangeQty(req, res) {
  const newQty = req.body.qty;
  const product = new Product(req.body.productId);
  const userId = req.session.user.id;

  try {
    const result = await product.setQuantity(newQty, userId);

    if (!result) {
      throw new Error("Failed to change item quantity!");
    }

    return res.redirect("back");
  } catch(err) {
    throw new Error(err);
  }
}

async function postDeleteFromCart(req, res) {
  const product = new Product(req.body.itemId);

  try {
    await product.deleteFrom("cart");
    
    --req.session.cartItems;

    return res.redirect("/user/cart");
  } catch(err) {
    throw new Error(err);
  }
}

async function getCleanCart(req, res) {
  const currentUser = new User(req.session.user.id);

  try {
    // Проверку на очистку
    await currentUser.clean("cart");
    
    req.session.cartItems = 0;

    return res.redirect("/user/cart");
  } catch(err) {
    throw new Error(err);
  }
}

// Wishlist
async function getWishlist(req, res) {
  const currentUser = new User(req.session.user.id);

  try {
    const rawListData = await currentUser.getEverythingFrom("wishlist");
    const wishlist = rawListData[0];

    const hasItems = (wishlist && wishlist.length > 0) ? true : false;

    return res.render("user/wishlist", {
      pageTitle: "Список желаемого",
      hasItems,
      wishlist
    });
  } catch(err) {
    throw new Error(err);
  }
}

async function postAddToWishlist(req, res) {
  try {
    const userId = req.session.user.id;
    const productId = req.body.productId;

    const [ productCheck ] = await Product.findById("products", productId);

    if (!productCheck[0]) {
      throw new Error("Product isn't found!");
    }

    const product = new Product(productId);
    const newItemAdded = await product.addTo("wishlist", userId);

    if (newItemAdded) {
      ++req.session.wishlistItems;
    }

    return res.redirect("back");
  } catch(err) {
    throw new Error(err);
  }
}

async function postDeleteFromWishlist(req, res) {
  try {
    const product = new Product(req.body.itemId);

    await product.deleteFrom("wishlist");
    
    --req.session.wishlistItems;

    return res.redirect("/user/wishlist");
  } catch(err) {
    throw new Error(err);
  }
}

async function getCleanWishlist(req, res) {
  const currentUser = new User(req.session.user.id);

  try {
    // Проверку на очистку
    await currentUser.clean("wishlist");
    
    req.session.wishlistItems = 0;

    return res.redirect("/user/wishlist");
  } catch(err) {
    throw new Error(err);
  }
}

// Orders
async function getCheckout(req, res) {
  try {
    const currentUser = new User(req.session.user.id);

    // Может корзину в сессию после логина, новые тоже в сессию, сессию сохранять вручную в стор после добавления.
    const [ cart ] = await currentUser.getEverythingFrom("cart");
    let cartHasItems = false;
    let orderContent = [];
    let totalPrice = 0;

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
      edit: false,
      cartHasItems,
      orderContent,
      totalPrice,
      hasError: false,
      errors: {}
    });
  } catch(err) {
    throw new Error(err);
  }
}

async function postCreateOrder(req, res) {
  try {
    const { name, phone, email, method, country, city, street, house, flat, postalCode, totalPrice } = req.body;

    const orderContent = JSON.parse(req.body.orderContent);

    let address = { country, city, street, house, flat, postalCode };

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("user/order-form", {
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

    // Добавить проверку
    await newOrder.create();

    await currentUser.clean("cart");
    req.session.cartItems = 0;
    
    return res.redirect("/user/orders");
  } catch(err) {
    throw new Error(err);
  }
}

async function getEditOrder(req, res) {
  try {
    const orderId = req.params.orderId;
    const [ rows ] = await Order.findById("orders", orderId);
    const order = rows[0];

    if (order.userId !== req.session.user.id) {
      throw new Error("Wrong user!");
    }

    // hasOrder

    order.address = JSON.parse(order.address);

    return res.render("user/order-form", {
      pageTitle: "Редактировать заказ",
      edit: true,
      order,
      hasError: false,
      errors: {}
    });
  } catch(err) {
    throw new Error(err);
  }
}

async function postEditOrder(req, res) {
  try {
    const { orderId, name, phone, email, method, country, city, street, house, flat, postalCode } = req.body;

    let address = { country, city, street, house, flat, postalCode };

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("user/order-form", {
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

    // Добавить проверку
    await newOrder.update();
    return res.redirect("/user/orders");
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
    // Уведомить админа об отмене заказа
    return res.render("utils/message", {
      pageTitle: "Заказ отменен",
      message: "Ваш заказ был успешно отменен"
    });
  } catch(err) {
    throw new Error(err);
  } 
}

async function getUserOrders(req, res) {
  const userId = req.session.user.id;

  try {
    const [ orders ] = await Order.findByField("orders", "userId", userId);

    const hasOrders = (orders && orders.length > 0) ? true : false;

    for (let order of orders) {
      order.address = JSON.parse(order.address);
      order.content = JSON.parse(order.content);
    }

    return res.render("user/orders", {
      pageTitle: "Ваши заказы",
      hasOrders,
      orders
    });
  } catch(err) {
    throw new Error(err);
  }
}

export default {
  getEditProfile,
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