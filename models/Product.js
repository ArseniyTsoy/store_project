import { getPool } from "../util/db.js";

export default class Product {
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