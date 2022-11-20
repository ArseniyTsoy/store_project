import Product from "../models/Product.js";
import Category from "../models/Category.js";
import equipError from "../utils/equipError.js";

async function getSingleProduct(req, res, next) {
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
  } catch(err) {
    return next(equipError(err));
  }
}

async function getIndex(req, res, next) {
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
    return next(equipError(err));
  }
}

function getAbout(req, res) {
  return res.render("store/about", {
    pageTitle: "О нас",
  });
}

async function getCatalog(req, res, next) {
  try {
    let products;
    let totalProducts;
    
    const filteredBy = parseInt(req.query.filteredBy) || null;
    const currentPage = parseInt(req.query.page) || 1;
    const limit = 3;
    const offset = currentPage > 1 ? limit * (currentPage - 1) : null;

    if (filteredBy) {
      totalProducts = await Product.countByField("products", "categoryId", filteredBy);

      [ products ] = await Product.findByField("products", "categoryId", filteredBy, limit, offset);
    } else {
      totalProducts = await Product.count("products");

      [ products ] = await Product.findAll("products", limit, offset);
    }

    const hasProducts = (products && products.length > 0) ? true : false;

    const categories = [];
    const [ rawCategories ] = await Category.findAll("categories");

    for (let item of rawCategories) {
      categories.push({
        id: item.id,
        title: item.title
      });
    }

    const hasCategories = (categories && categories.length > 0) ? true : false;

    return res.render("store/catalog", {
      pageTitle: "Каталог товаров",
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
  } catch (err) {
    return next(equipError(err));
  }
}

async function getCategory(req, res, next) {
  try {
    const filteredBy = parseInt(req.query.filteredBy);
    const currentPage = parseInt(req.query.page) || 1;
    const limit = 3;
    const offset = currentPage > 1 ? limit * (currentPage - 1) : null;

    const totalProducts = await Product.countByField("products", "categoryId", filteredBy);
  
    const [ products ] = await Product.findByField("products", "categoryId", filteredBy, limit, offset);

    const hasProducts = (products && products.length > 0) ? true : false;

    return res.render("store/category", {
      pageTitle: req.query.catTitle,
      hasProducts,
      products,
      filteredBy,
      // Pagination
      currentPage,
      hasNextPage: (limit * currentPage) < totalProducts,
      hasPreviousPage: currentPage > 1,
      nextPage: currentPage + 1,
      previousPage: currentPage - 1,
      lastPage: Math.ceil(totalProducts / limit)
    });
  } catch (err) {
    return next(equipError(err));
  }
}

async function getSearch(req, res, next) {
  try {
    const filteredBy = req.query.filteredBy || null;

    if (filteredBy) {

      if (filteredBy.length < 3) {
        return res.render("store/search", {
          pageTitle: "Поиск",
          searchPerformed: false,
          filteredBy: null,
          error: "Запрос не может быть короче трех символов"
        });
      }

      const currentPage = parseInt(req.query.page) || 1;
      const limit = 3;
      const offset = currentPage > 1 ? limit * (currentPage - 1) : null;

      const [ searchResults ] = await Product.search(filteredBy, limit, offset);

      const [ rows ] = await Product.search(filteredBy);
      const totalFound = rows.length;

      const hasResults = (searchResults && searchResults.length > 0) ? true : false;

      return res.render("store/search", {
        pageTitle: "Поиск",
        searchPerformed: true,
        hasResults,
        filteredBy,
        searchResults,
        // Pagination
        currentPage,
        hasNextPage: (limit * currentPage) < totalFound,
        hasPreviousPage: currentPage > 1,
        nextPage: currentPage + 1,
        previousPage: currentPage - 1,
        lastPage: Math.ceil(totalFound / limit)
      });
    } else {
      return res.render("store/search", {
        pageTitle: "Поиск",
        searchPerformed: false,
        filteredBy
      });
    }
  } catch(err) {
    return next(equipError(err));
  }
}

export default {
  getSingleProduct,
  getIndex,
  getAbout,
  getCatalog,
  getCategory,
  getSearch
};