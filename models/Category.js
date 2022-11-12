import { getPool } from "../utils/db.js";

export default class Category {

  constructor(id, title, description, imageUrl) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.imageUrl = imageUrl;
  }

  async create() {
    try {
      const pool = await getPool();

      const sql = "INSERT INTO categories (title, description, imageUrl) VALUES (?, ?, ?)";
    
      const values = [
        this.title,
        this.description,
        this.imageUrl
      ];

      return pool.execute(sql, values);
    } catch(err) {
      throw new Error(err);
    }
  }

  async updateAll() {
    try {
      const pool = await getPool();

      const sql = `UPDATE categories SET
          title = ?,
          description = ?,
          imageUrl = ? 
        WHERE id = ?`;

      const values = [this.title, this.description, this.imageUrl, this.id];

      return pool.execute(sql, values);
    } catch(err) {
      throw new Error(err);
    }
  }

  static async deleteById(categoryId) {
    try {
      const pool = await getPool();

      return pool.execute("DELETE FROM categories WHERE id =?", [categoryId]);
    } catch(err) {
      throw new Error(err);
    }
  }

  static async findTaggedProducts(catId) {
    try {
      const pool = await getPool();

      return pool.execute("SELECT * FROM products WHERE categoryId = ? ORDER BY id DESC", [catId]);
    } catch(err) {
      throw new Error(err);
    }
  }

  static async findById(catId) {
    try {
      const pool = await getPool();

      return pool.execute("SELECT * FROM categories WHERE id = ?", [catId]);
    } catch(err) {
      throw new Error(err);
    }
  }

  static async findAll() {
    try {
      const pool = await getPool();
      
      return pool.execute("SELECT * FROM categories ORDER BY id DESC");
    } catch(err) {
      throw new Error(err);
    }
  }
};