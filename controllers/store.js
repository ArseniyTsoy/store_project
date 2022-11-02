const Product = require("../models/Product");

// To admin
function getCreateProduct(_, res) {
  return res.render("admin/create-product", {
    pageTitle: "Добавить новый товар",
  });
}

// To admin
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

    await newProduct.save();

    return res.redirect("/");
  } catch (err) {
    throw new Error(err);
  }
}

async function getSingleProduct(req, res) {
  const id = req.params.id;

  try {
    const rawProductData = await Product.findById(id);
    const product = rawProductData[0][0];

    const productIsFound = product ? true : false;

    return res.render("store/show-product", {
      pageTitle: product.title,
      productIsFound,
      product,
    });
  } catch (err) {
    throw new Error(err);
  }
}

async function getAllProducts(req, res) {
  try {
    const products = await Product.findAll();

    const hasProducts = products && products.length > 0 ? true : false;

    return res.render("store/index", {
      // В локальные переменные цикла req-res
      // cartItems: req.session.cartItems,
      // user: req.session.user,
      pageTitle: "Главная",
      hasProducts: hasProducts,
      products: products[0],
    });
  } catch (err) {
    throw new Error(err);
  }
}

function getAbout(_, res) {
  return res.render("store/about", {
    pageTitle: "О нас",
  });
}

async function getCatalog(_, res) {
  try {
    const products = await Product.findAll();

    const hasProducts = products && products.length > 0 ? true : false;

    return res.render("store/catalog", {
      pageTitle: "Каталог",
      hasProducts: hasProducts,
      products: products[0],
    });
  } catch (err) {
    throw new Error(err);
  }
}

async function getCategory(req, res) {
  const chosenCategory = req.query.category;
  const categoryTitle = req.query.title;

  try {
    const products = await Product.findByCategory(chosenCategory);

    const hasProducts = products[0] && products[0].length > 0 ? true : false;

    return res.render("store/category", {
      pageTitle: "Категории товаров",
      hasProducts,
      categoryTitle,
      products: products[0],
    });
  } catch (err) {
    throw new Error(err);
  }
}

function getSearch(_, res) {
  return res.render("store/search", {
    searchPerformed: false,
    searchString: null
  });
}

async function postSearch(req, res) {
  const searchString = req.body.enteredString;

  try {
    const rawSearchData = await Product.search(searchString);

    const searchResults = rawSearchData[0];

    // console.log(searchResults);
    // process.exit();

    const hasResults = (searchResults && searchResults.length > 0) ? true : false;

    return res.render("store/search", {
      searchPerformed: true,
      hasResults,
      searchString,
      searchResults,
    }); 
  } catch(err) {
    throw new Error(err);
  }
}

module.exports = {
  getCreateProduct,
  postCreateProduct,
  getSingleProduct,
  getAllProducts,
  getAbout,
  getCatalog,
  getCategory,
  getSearch,
  postSearch
};
