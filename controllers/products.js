const Product = require("../models/Product");

function offerCreateProduct(_, res) {
  res.render("store/create-product");
}

async function createProduct(req, res) {
  const title = req.body.title;
  const imageUrl = req.file.path;
  const description = req.body.description;
  const weight = req.body.weight;
  const price = req.body.price;

  try {
    const newProduct = new Product(title, imageUrl, description, weight, price);

    await newProduct.save();
    
    res.redirect("/");
  } catch(err) {
    throw new Error(err);
  }
}

async function showProduct(req, res) {
  const id = req.params.id;

  try {
    const product = await Product.findById(id);

    res.render("single_product", { 
      title: product.title,
      description: product.description,
      weight: product.weight,
      price: product.price 
    });
  } catch(err) {
    throw new Error(err);
  }
}

async function showAll(_, res) {
  try {
    const products = await Product.findAll();

    const hasProducts = (products && products.length > 0) ? true : false;

    res.render("store/index", {
      hasProducts: hasProducts,
      products: products[0]
    });
  } catch(err) {
    throw new Error(err);
  }
}

module.exports = {
  offerCreateProduct: offerCreateProduct,
  createProduct: createProduct,
  showProduct: showProduct,
  showAll: showAll
};