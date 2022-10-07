const { getPool } = require("../util/db");

module.exports = class Product {
  constructor(title, imageUrl, description, weight, price) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.weight = weight;
    this.price = price;
  }

  async save() {
    try {
      const pool = await getPool();

      const sql = "INSERT INTO `products` (`title`, `imageUrl`, `description`, `weight`, `price`) VALUES (?, ?, ?, ?, ?)";
      const values = [
        this.title,
        this.imageUrl,
        this.description,
        this.weight,
        this.price
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

  static async findAll() {
    try {
      const pool = await getPool();

      return pool.execute("SELECT * FROM products");
    } catch(err) {
      throw new Error(err);
    }
  }
};