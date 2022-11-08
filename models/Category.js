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
      throw new Error("Failed to save!");
    }
  }

  static deleteById() {
    
  }

  static async findAll() {
    try {
      const pool = getPool();

      return pool.execute("SELECT * FROM categories");
    } catch(err) {
      throw new Error(err);
    }
  }

  static async findTaggedProducts(catId) {
    try {
      const pool = await getPool();

      return pool.execute("SELECT * FROM products WHERE categoryId = ?", [catId]);
    } catch(err) {
      throw new Error(err);
    }
  }
};