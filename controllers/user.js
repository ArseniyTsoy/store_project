const User = require("../models/User");
const Product = require("../models/Product");

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
  const productId = req.body.productId;
  const quantity = +req.body.qty;
  const userId = req.session.user.id;

  try {
    const rawProduct = await Product.findById(productId);

    if (!rawProduct) {
      throw new Error("Product isn't found!");
    }

    const { id, title, price, imageUrl } = rawProduct[0][0];
    const processedProduct = new Product(id, title, price, imageUrl);

    const newItemAdded = await processedProduct.addToCart(quantity, userId);

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
  const productId = req.body.productId;
  const userId = req.session.user.id;

  try {
    const rawProduct = await Product.findById(productId);

    if (!rawProduct) {
      throw new Error("Product isn't found!");
    }

    const { id, title, price, imageUrl } = rawProduct[0][0];
    const processedProduct = new Product(id, title, price, imageUrl);

    const newItemAdded = await processedProduct.addToWishlist(userId);

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

module.exports = {
  getEditProfile,
  getCart,
  postAddToCart,
  postDeleteFromCart,
  getCleanCart,
  getWishlist,
  postAddToWishlist,
  postDeleteFromWishlist,
  getCleanWishlist
};