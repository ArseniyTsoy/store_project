import Product from "../models/Product.js";
import Category from "../models/Category.js";

async function getSingleProduct(req, res) {
  const id = req.params.id;

  try {
    const [ rows ] = await Product.findById("products", id);
    const product = rows[0];

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

async function getIndex(req, res) {
  try {
    const [ products ] = await Product.findAll("products");

    const hasProducts = (products && products.length > 0) ? true : false;

    const [ categories ] = await Category.findAll("categories");

    const hasCategories = (categories && categories.length > 0) ? true : false;

    return res.render("store/index", {
      pageTitle: "Главная",
      hasProducts,
      hasCategories,
      products,
      categories
    });
  } catch (err) {
    throw new Error(err);
  }
}

function getAbout(req, res) {
  return res.render("store/about", {
    pageTitle: "О нас",
  });
}

async function getCatalog(req, res) {
  const catId = req.query.catId;

  try {
    let products;

    if (catId) {
      [ products ] = await Product.findByField("products", "categoryId", catId);
    } else {
      [ products ] = await Product.findAll("products");
    }

    const hasProducts = (products && products.length > 0) ? true : false;

    const [ categories ] = await Category.findAll("categories");

    const hasCategories = (categories && categories.length > 0) ? true : false;

    return res.render("store/catalog", {
      pageTitle: "Каталог",
      hasProducts,
      products,
      hasCategories,
      categories
    });
  } catch (err) {
    throw new Error(err);
  }
}

async function getCategory(req, res) {
  const { catId, catTitle } = req.query;

  try {
    const rawProductsData = await Product.findByField("products", "categoryId", catId);
    const products = rawProductsData[0];

    const hasProducts = (products && products.length > 0) ? true : false;

    return res.render("store/category", {
      pageTitle: "Категории товаров",
      catTitle,
      hasProducts,
      products
    });
  } catch (err) {
    throw new Error(err);
  }
}

function getSearch(req, res) {
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

export default {
  getSingleProduct,
  getIndex,
  getAbout,
  getCatalog,
  getCategory,
  getSearch,
  postSearch
};