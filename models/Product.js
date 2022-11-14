import BaseModel from "./BaseModel.js";
import { getPool } from "../utils/db.js";

export default class Product extends BaseModel {
  constructor(id, title, price, imageUrl, description, categoryId) {
    super();
    
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

  async setQuantity(newQty, userId) {
    try {
      console.log(newQty);
      const pool = await getPool();

      return pool.execute("UPDATE cart SET quantity = ? WHERE userId = ? AND productId = ?", [newQty, userId, this.id]);
    } catch(err) {
      throw new Error(err);
    }
  }

  async addTo(tableName, userId, quantity) {
    try {

      if (typeof tableName !== "string") {
        throw new Error("Wrong type!");
      }

      const pool = await getPool();
            
      const [ rows ] = await pool.execute(`SELECT * FROM ${tableName} WHERE userId = ? AND productId = ?`, [userId, this.id]);

      const alreadyAdded = rows[0];

      if (!alreadyAdded) {

        const [ result ] = await pool.execute(`INSERT INTO ${tableName} (userId, productId) VALUES (?, ?)`, [userId, this.id]);

        if (!result) {

        }

        if (tableName === "cart") {
          await this.setQuantity(quantity, userId);
        }

        return true;
      } else {

        if (tableName === "cart") {
          const newQuantity = alreadyAdded.quantity + quantity;
          await this.setQuantity(newQuantity, userId);
        }

        return false;
      }
    } catch(err) {
      throw new Error(err);
    }
  }

  async deleteFrom(tableName) {
    try {

      if (typeof tableName !== "string") {
        throw new Error("Wrong type!");
      }

      const pool = await getPool();
      
      return pool.execute(`DELETE FROM ${tableName} WHERE id = ?`, [this.id]);
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