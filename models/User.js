import { getPool } from "../utils/db.js";

export default class User {
  constructor(id, name, email, imageUrl, password, resetToken, resetTokenExpiration) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.imageUrl = imageUrl;
    this.password = password;
    this.resetToken = resetToken;
    this.resetTokenExpiration = resetTokenExpiration;
  }

  // Change name to "create"
  async create() {
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

  async updateAll() {
    try {
      const pool = await getPool();
      
      const sql = `UPDATE users SET 
        name = ?, 
        email = ?,
        imageUrl = ?,
        password = ?,
        resetToken = ?,
        resetTokenExpiration = ?
      WHERE id = ?`; 

      const values = [
        this.name, 
        this.email,
        this.imageUrl,
        this.password,
        this.resetToken,
        this.resetTokenExpiration,
        this.id
      ];

      return pool.execute(sql, values);
    } catch(err) {
      throw new Error("Failed to alter the user!");
    }
  }

  async updateField(fieldName) {
    try {
      // Проверка на строку
      if (!fieldName) {
        throw new Error("Поле не указано!");
      }

      const pool = await getPool();
      
      const sql = `UPDATE users SET ${fieldName} = ? WHERE id = ?`; 

      const values = [this[fieldName], this.id];

      return pool.execute(sql, values);
    } catch(err) {
      throw new Error("Failed to alter the user!");
    }
  }

  static async findById(userId) {
    try {
      const pool = await getPool();

      return pool.execute("SELECT * FROM users WHERE id = ?", [userId]);
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

  static async deleteById(userId) {
    try {
      const pool = await getPool();

      return pool.execute("DELETE FROM users WHERE id = ?", [userId]); 
    } catch(err) {
      throw new Error(err);
    }
  }

  static async findAll() {
    try {
      const pool = await getPool();

      return pool.execute("SELECT * FROM users");
    } catch(err) {
      throw new Error(err);
    }
  }

  async getCart() {
    try {
      const pool = await getPool();

      const sql = `SELECT 
          cart.id,
          cart.user_id, 
          cart.product_id, 
          p.title, 
          p.price, 
          cart.quantity, 
          p.imageUrl 
        FROM cart INNER JOIN products p 
        ON cart.product_id = p.id  
        WHERE cart.user_id = ?`;

      return pool.execute(sql, [this.id]);
    } catch(err) {
      throw new Error(err);
    }
  }

  async countCart() {
    try {
      const pool = await getPool();

      return pool.execute("SELECT COUNT (*) FROM cart WHERE user_id = ?", [this.id]);
    } catch(err) {
      throw new Error(err);
    }
  }

  static async addToCart(userId, productId, quantity) {
    try {
      const pool = await getPool();
      let sql;
      let values;
      let newItemAdded;

      let alreadyInCart = await pool.execute("SELECT * FROM cart WHERE user_id = ? AND product_id = ?", [userId, productId]);

      alreadyInCart = alreadyInCart[0][0];

      if (!alreadyInCart) {
        sql = `INSERT INTO cart (
          user_id, 
          product_id, 
          quantity
          ) VALUES (?, ?, ?)`;

        values = [
          userId, 
          productId, 
          quantity
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

  async cleanCart() {
    try {
      const pool = await getPool();

      return pool.execute("DELETE FROM cart WHERE user_id = ?", [this.id]);
    } catch(err) {
      throw new Error(err);
    }
  }

  async getWishlist() {
    try {
      const pool = await getPool();
      
      const sql = `SELECT 
          w.id,
          w.user_id,
          w.product_id,
          p.title,
          p.price,
          p.imageUrl
        FROM wishlist w INNER JOIN products p
        ON w.product_id = p.id
        WHERE w.user_id = ?`;

      return pool.execute(sql, [this.id]);
    } catch(err) {
      throw new Error(err);
    }
  }

  async countWishlist() {
    try {
      const pool = await getPool();

      return pool.execute("SELECT COUNT (*) FROM wishlist WHERE user_id = ?", [this.id]);
    } catch(err) {
      throw new Error(err);
    }
  }

  static async addToWishlist(userId, productId) {
    try {
      const pool = await getPool();
      let sql;
      let values;
      let newItemAdded;

      let alreadyInWishlist = await pool.execute("SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?", [userId, productId]);
      
      alreadyInWishlist = alreadyInWishlist[0][0];
      
      if (!alreadyInWishlist) {
        sql = `INSERT INTO wishlist (
          user_id, 
          product_id
        ) VALUES (?, ?)`;

        values = [
          userId, 
          productId
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

  async cleanWishlist() {
    try {
      const pool = await getPool();

      return pool.execute("DELETE FROM wishlist WHERE user_id = ?", [this.id]);
    } catch(err) {
      throw new Error(err);
    }
  }
};