const { getPool } = require("../util/db");

module.exports = class User {
  constructor(name, email, imageUrl, password, id = null) {
    this.name = name;
    this.email = email;
    this.imageUrl = imageUrl;
    this.password = password;
    this.id = id;
  }

  // Change name to "create"
  async save() {
    try {
      const pool = await getPool();
      
      const sql = "INSERT INTO users (name, email, imageUrl, password) VALUES (?, ?, ?, ?)";
      const values = [
        this.name, 
        this.email,
        this.imageUrl,
        this.password
      ];

      return pool.execute(sql, values);
    } catch(err) {
      throw new Error("Failed to register new user!");
    }
  }

  static async findById(userId) {
    try {
      const pool = await getPool();

      return pool.execute("SELECT id, name, email, password, imageUrl FROM users WHERE id = ?", [userId]);
    } catch(err) {
      throw new Error(err);
    }
  }

  static async findOne(field, value) {
    try {
      const pool = await getPool();
      
      const sql = `SELECT * FROM users WHERE ${field} = ?`;
      return pool.execute(sql, [value]);
    } catch(err) {
      throw new Error(err);
    }
  }

  static async getCart(userId) {
    try {
      const pool = await getPool();
      return pool.execute("SELECT * FROM cart WHERE user_id = ?", [userId]);
      
    } catch(err) {
      throw new Error(err);
    }
  }

  static async addToCart(product, quantity, userId) {
    try {
      const pool = await getPool();
      let sql;
      let values;
      let newItemAdded;

      let alreadyInCart = await pool.execute("SELECT * FROM cart WHERE user_id = ? AND product_id = ?", [userId, product.id]);

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
          product.id, 
          product.title,
          product.price,
          quantity, 
          product.imageUrl
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

  static async deleteFromCart(itemId) {
    try {
      const pool = await getPool();

      return pool.execute("DELETE FROM cart WHERE id = ?", [itemId]);
    } catch(err) {
      throw new Error(err);
    }
  }

  static async cleanCart(userId) {
    try {
      const pool = await getPool();

      return pool.execute("DELETE FROM cart WHERE user_id = ?", [userId]);
    } catch(err) {
      throw new Error(err);
    }
  }

  static async getWishlist(userId) {
    try {
      const pool = await getPool();

      return pool.execute("SELECT * FROM wishlist WHERE user_id = ?", [userId]);
      
    } catch(err) {
      throw new Error(err);
    }
  }

  static async addToWishlist(product, userId) {
    try {
      const pool = await getPool();
      let sql;
      let values;
      let newItemAdded;

      let alreadyInWishlist = await pool.execute("SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?", [userId, product.id]);
      
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
          product.id, 
          product.title,
          product.price, 
          product.imageUrl
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

  static async deleteFromWishlist(itemId) {
    try {
      const pool = await getPool();

      return pool.execute("DELETE FROM wishlist WHERE id = ?", [itemId]);
    } catch(err) {
      throw new Error(err);
    }
  }

  static async cleanWishlist(userId) {
    try {
      const pool = await getPool();

      return pool.execute("DELETE FROM wishlist WHERE user_id = ?", [userId]);
    } catch(err) {
      throw new Error(err);
    }
  }
};