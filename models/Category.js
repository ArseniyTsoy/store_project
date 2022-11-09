import { getPool } from "../utils/db.js";

export default class Category {

  constructor(id, title, description, imageUrl) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.imageUrl = imageUrl;
  }

  create() {
    const pool = getPool();

    const sql = "INSERT INTO categories (title, description, imageUrl) VALUES (?, ?, ?)";
    
    const values = [
      this.title,
      this.description,
      this.imageUrl
    ];

    return pool.execute(sql, values);
  }

  static deleteById(categoryId) {
    const pool = getPool();
    return pool.execute("DELETE FROM categories WHERE id =?", [categoryId]);
  }

  static findAll() {
    const pool = getPool();
    return pool.execute("SELECT * FROM categories");
  }

  static findTaggedProducts(catId) {
    const pool = getPool();
    return pool.execute("SELECT * FROM products WHERE categoryId = ?", [catId]);
  }
};