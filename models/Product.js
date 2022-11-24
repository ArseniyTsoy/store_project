import BaseModel from "./BaseModel.js";
import { getPool } from "../utils/db.js";
import equipError from "../utils/equipError.js";

const TABLE_NAME = "products";

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

      const [ result ] = await pool.execute(sql, values);
      return result;
    } catch(err) {
      throw equipError(err);
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

      const [ result ] = await pool.execute(sql, values);
      return result;
    } catch(err) {
      throw equipError(err);
    }
  }

  async setQuantity(newQty, userId) {
    try {
      const pool = await getPool();

      const [ result ] = await pool.execute("UPDATE cart SET quantity = ? WHERE userId = ? AND productId = ?", [newQty, userId, this.id]);
      
      return result;
    } catch(err) {
      throw equipError(err);
    }
  }

  async addTo(tableName, userId, quantity) {
    try {

      if (typeof tableName !== "string") {
        throw new Error("Название таблицы должно быть строкой");
      }

      const pool = await getPool();
            
      const [ rows ] = await pool.execute(`SELECT * FROM ${tableName} WHERE userId = ? AND productId = ?`, [userId, this.id]);

      const alreadyAdded = rows[0];

      if (!alreadyAdded) {

        const [ result ] = await pool.execute(`INSERT INTO ${tableName} (userId, productId) VALUES (?, ?)`, [userId, this.id]);

        if (!result) {
          throw new Error("Не удалость добавить выбранынный товар");
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
      throw equipError(err);
    }
  }

  async deleteFrom(tableName) {
    try {

      if (typeof tableName !== "string") {
        throw new Error("Название таблицы должно быть строкой");
      }

      const pool = await getPool();
      
      const [ result ] = await pool.execute(`DELETE FROM ${tableName} WHERE id = ?`, [this.id]);
      
      return result;
    } catch(err) {
      throw equipError(err);
    }
  }

  static async search(searchString, limit = null, offset = null) {
    try {
      const pool = await getPool();

      let sql = `SELECT 
        p.id, p.title, p.price, p.imageUrl
        FROM products p
        INNER JOIN categories c
        ON p.categoryId = c.id
        WHERE p.title LIKE ? 
        OR c.title LIKE ? ORDER BY p.id DESC`;

      if (limit) {
        sql += ` LIMIT ${limit}`;
      }

      if (offset) {
        sql += ` OFFSET ${offset}`;
      }

      const values = [
        `%${searchString}%`, 
        `%${searchString}%`
      ];

      const [ results ] = await pool.execute(sql, values);

      return results;
    } catch(err) {
      throw equipError(err);
    }
  }

  // Overriden parent methods
  static async count(tableName = TABLE_NAME) {
    return super.count(tableName);
  }

  static async countByField(fieldName, fieldValue, tableName = TABLE_NAME) {
    return super.countByField(fieldName, fieldValue, tableName);
  }

  static async findById(id, tableName = TABLE_NAME) {
    return super.findById(id, tableName);
  }

  static async findByField(fieldName, fieldValue, limit = null, offset = null, tableName = TABLE_NAME) {
    return super.findByField(fieldName, fieldValue, limit, offset, tableName);
  }

  static async findAll(limit = null, offset = null, tableName = TABLE_NAME) {
    return super.findAll(limit, offset, tableName);
  }

  static async deleteById(id, tableName = TABLE_NAME) {
    return super.deleteById(id, tableName);
  }
};