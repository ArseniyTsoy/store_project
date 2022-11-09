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

  create() {
    const pool = getPool();

    const sql = "INSERT INTO products (title, price, imageUrl, description, categoryId) VALUES (?, ?, ?, ?, ?)";
      
    const values = [
      this.title,
      this.price,
      this.imageUrl,
      this.description,
      this.categoryId
    ];

    return pool.execute(sql, values);
  }

  update() {
    const pool = getPool();

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
  }

  static deleteById(productId) {
    const pool = getPool();
    return pool.execute("DELETE FROM products WHERE id = ?", [productId]);
  }

  static findById(id) {
    const pool = getPool();
    return pool.execute("SELECT * FROM products WHERE id = ?", [id]);
  }

  static findAll() {
    const pool = getPool();

    return pool.execute("SELECT * FROM products ORDER BY id DESC");
  }

  static search(searchString) {
    const pool = getPool();

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
  }
};