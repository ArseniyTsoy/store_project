import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// User profile
async function getEditProfile(req, res) {
  const userId = req.params.id;

  try {
    const rawUser = await User.findOne("id", userId);

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
    const rawCartData = await currentUser.getCart();
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
    const productCheck = await Product.findById(productId);

    if (!productCheck) {
      throw new Error("Product isn't found!");
    }

    const newItemAdded = await User.addToCart(userId, productId, quantity);

    if (newItemAdded) {
      ++req.session.cartItems;
    }

    return res.redirect("/");
  } catch(err) {
    throw new Error(err);
  }
}

async function postDeleteFromCart(req, res) {
  const itemId = req.body.itemId;

  try {
    await User.deleteFromCart(itemId);
    
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
    await currentUser.cleanCart();
    
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
    const rawListData = await currentUser.getWishlist();
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
  const userId = req.session.user.id;
  const productId = req.body.productId;

  try {
    const productCheck = await Product.findById(productId);

    if (!productCheck) {
      throw new Error("Product isn't found!");
    }

    const newItemAdded = await User.addToWishlist(userId, productId);

    if (newItemAdded) {
      ++req.session.wishlistItems;
    }

    return res.redirect("/");
  } catch(err) {
    throw new Error(err);
  }
}

async function postDeleteFromWishlist(req, res) {
  const itemId = req.body.itemId;

  try {
    await User.deleteFromWishlist(itemId);
    
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
    await currentUser.cleanWishlist();
    
    req.session.wishlistItems = 0;

    return res.redirect("/user/wishlist");
  } catch(err) {
    throw new Error(err);
  }
}

// Orders
async function getCheckout(req, res) {
  const currentUser = new User(req.session.user.id);

  try {
    const cart = await currentUser.getCart();
    const processedCart = cart[0];
    let cartHasItems = false;
    let orderContent = "";
    let totalPrice = 0;

    if (processedCart && processedCart.length > 0) {
      cartHasItems = true;

      for (let item of processedCart) {
        orderContent += `${item.title} (${item.quantity}) `;
        totalPrice += item.quantity * item.price;
      }
    } else {
      cartHasItems = false;
    }

    return res.render("user/checkout", {
      cartHasItems,
      cart: processedCart,
      orderContent: orderContent.trimEnd(),
      totalPrice
    });
  } catch(err) {
    throw new Error(err);
  }
}

async function postCheckout(req, res) {
  const currentUser = new User(req.session.user.id);
  const { name, phone, email, method, content, total_price  } = req.body;
  const { country, city, street, house, appartment, postalCode } = req.body;
  const address = `${country}, ${city}, ул. ${street} ${house}, дом ${appartment}. Почтовый индекс: ${postalCode}.`;
  const placed_on = (new Date()).toLocaleDateString();
  

  const newOrder = new Order(null, currentUser.id, name, phone, email, method, address, content, total_price, placed_on);

  try {
    // Добавить проверку
    await newOrder.create();

    await currentUser.cleanCart();
    req.session.cartItems = 0;
    
    return res.redirect("/user/orders");
  } catch(err) {
    throw new Error(err);
  }
}

async function getUserOrders(req, res) {
  const userId = req.session.user.id;

  try {
    const rawOrdersData = await Order.findByUser(userId);
    const orders = rawOrdersData[0];

    const hasOrders = (orders && orders.length > 0) ? true : false;

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
  postDeleteFromCart,
  getCleanCart,
  getWishlist,
  postAddToWishlist,
  postDeleteFromWishlist,
  getCleanWishlist,
  getCheckout,
  postCheckout,
  getUserOrders
};