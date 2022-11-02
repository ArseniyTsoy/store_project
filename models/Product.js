const { getPool } = require("../util/db");

module.exports = class Product {
  constructor(id, title, price, imageUrl, description, category) {
    this.id = id,
    this.title = title;
    this.price = price;
    this.imageUrl = imageUrl;
    this.description = description;
    this.category = category;
  }

  async create() {
    try {
      const pool = await getPool();

      const sql = "INSERT INTO products (title, price, imageUrl, description, category) VALUES (?, ?, ?, ?, ?)";
      
      const values = [
        this.title,
        this.price,
        this.imageUrl,
        this.description,
        this.category
      ];

      return pool.execute(sql, values);
    } catch(err) {
      throw new Error("Failed to save!");
    }
  }

  async addToCart(quantity, userId) {
    try {
      const pool = await getPool();
      let sql;
      let values;
      let newItemAdded;

      let alreadyInCart = await pool.execute("SELECT * FROM cart WHERE user_id = ? AND product_id = ?", [userId, this.id]);

      alreadyInCart = alreadyInCart[0][0];

      if (!alreadyInCart) {
        sql = `INSERT INTO cart (
          user_id, 
          product_id, 
          product_title, 
          product_price, 
          quantity, 
          product_imageUrl
          ) VALUES (?, ?, ?, ?, ?, ?)`;

        values = [
          userId, 
          this.id, 
          this.title,
          this.price,
          quantity, 
          this.imageUrl
        ];

        newItemAdded = true;
      } else {
        const newQuantity = alreadyInCart.quantity + quantity;

        sql = "UPDATE cart SET quantity = ? WHERE id = ?";

        values = [
          newQuantity, 
          alreadyInCart.id
        ];

        newItemAdded = false;
      }

      await pool.execute(sql, values);
      return newItemAdded;
    } catch(err) {
      throw new Error(err);
    }
  }

  async addToWishlist(userId) {
    try {
      const pool = await getPool();
      let sql;
      let values;
      let newItemAdded;

      let alreadyInWishlist = await pool.execute("SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?", [userId, this.id]);
      
      alreadyInWishlist = alreadyInWishlist[0][0];
      
      if (!alreadyInWishlist) {
        sql = `INSERT INTO wishlist (
          user_id, 
          product_id, 
          product_title, 
          product_price, 
          product_imageUrl
        ) VALUES (?, ?, ?, ?, ?)`;

        values = [
          userId, 
          this.id, 
          this.title,
          this.price, 
          this.imageUrl
        ];

        await pool.execute(sql, values);

        newItemAdded = true;
        return newItemAdded;
      } else {
        console.log("Already in wishlist");
        newItemAdded = false;
        return newItemAdded;
      }
    } catch(err) {
      throw new Error(err);
    }
  }

  static deleteById() {
    
  }

  static async findById(id) {
    try {
      const pool = await getPool();

      return pool.execute("SELECT * FROM `products` WHERE `id` = ?", [id]);
    } catch(err) {
      throw new Error(err);
    }
  }

  static async findByCategory(category) {
    try {
      const pool = await getPool();

      return pool.execute("SELECT * FROM `products` WHERE `category` = ?", [category]);
    } catch(err) {
      throw new Error(err);
    }
  }

  static async findAll() {
    try {
      const pool = await getPool();

      return pool.execute("SELECT * FROM products");
    } catch(err) {
      throw new Error(err);
    }
  }

  static async search(searchString) {
    try {
      const pool = await getPool();

      // Inner JOIN
      return pool.execute(
        "SELECT * FROM products WHERE title LIKE ? OR category LIKE ?", 
        [
          `%${searchString}%`, 
          `%${searchString}%`
        ]);
    } catch(err) {
      throw new Error(err);
    }
  }
};