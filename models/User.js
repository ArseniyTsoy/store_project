const { getPool } = require("../util/db");

module.exports = class User {
  constructor(id, name, email, imageUrl, password) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.imageUrl = imageUrl;
    this.password = password;
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

      return pool.execute("SELECT * FROM cart WHERE user_id = ?", [this.id]);
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

      return pool.execute("SELECT * FROM wishlist WHERE user_id = ?", [this.id]);
      
    } catch(err) {
      throw new Error(err);
    }
  }

  async countWishlist() {
    try {
      const pool = await getPool();

      const result = await pool.execute("SELECT COUNT (*) FROM wishlist WHERE user_id = ?", [this.id]);
      return result;
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