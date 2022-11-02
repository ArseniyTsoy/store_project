const { getPool } = require("../util/db");

module.exports = class Product {
  constructor(title, category, price, imageUrl, description) {
    this.title = title;
    this.category = category;
    this.price = price;
    this.imageUrl = imageUrl;
    this.description = description;
  }

  async save() {
    try {
      const pool = await getPool();

      const sql = "INSERT INTO `products` (`title`, `category`, `price`, `imageUrl`, `description`) VALUES (?, ?, ?, ?, ?)";
      
      const values = [
        this.title,
        this.category,
        this.price,
        this.imageUrl,
        this.description
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