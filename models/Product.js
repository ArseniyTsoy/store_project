import { getPool } from "../utils/db.js";

export default class Product {

  constructor(id, title, price, imageUrl, description, categoryId) {
    this.id = id,
    this.title = title;
    this.price = price;
    this.imageUrl = imageUrl;
    this.description = description;
    this.categoryId = categoryId;
  }

  async create() {
    try {
      const pool = await getPool();

      const sql = "INSERT INTO products (title, price, imageUrl, description, categoryId) VALUES (?, ?, ?, ?, ?)";
        
      const values = [
        this.title,
        this.price,
        this.imageUrl,
        this.description,
        this.categoryId
      ];

      return pool.execute(sql, values);
    } catch(err) {
      throw new Error(err);
    }
  }

  async update() {
    try {
      const pool = await getPool();

      const sql = `UPDATE products SET
        title = ?, 
        price = ?, 
        imageUrl = ?, 
        description = ?, 
        categoryId = ? 
      WHERE id = ?`;
      
      const values = [
        this.title,
        this.price,
        this.imageUrl,
        this.description,
        this.categoryId,
        this.id
      ];

      return pool.execute(sql, values);
    } catch(err) {
      throw new Error(err);
    }
  }

  static async deleteById(productId) {
    try {
      const pool = await getPool();

      return pool.execute("DELETE FROM products WHERE id = ?", [productId]);
    } catch(err) {
      throw new Error(err);
    }
  }

  static async findById(id) {
    try {
      const pool = await getPool();

      return pool.execute("SELECT * FROM products WHERE id = ?", [id]);
    } catch(err) {
      throw new Error(err);
    }
  }

  static async findAll() {
    try {
      const pool = await getPool();

      return pool.execute("SELECT * FROM products ORDER BY id DESC");
    } catch(err) {
      throw new Error(err);
    }
  }

  static async search(searchString) {
    try {
      const pool = await getPool();

      const sql = `SELECT 
        p.id, p.title, p.price, p.imageUrl
        FROM products p
        INNER JOIN categories c
        ON p.categoryId = c.id
        WHERE p.title LIKE ? 
        OR c.title LIKE ? ORDER BY p.id DESC`;

      const values = [
        `%${searchString}%`, 
        `%${searchString}%`
      ];

      return pool.execute(sql, values);
    } catch(err) {
      throw new Error(err);
    }
  }
};