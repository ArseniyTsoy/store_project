import BaseModel from "./BaseModel.js";
import { getPool } from "../utils/db.js";
import equipError from "../utils/equipError.js";

const TABLE_NAME = "users";

export default class User extends BaseModel {
  constructor(id, name, email, imageUrl, password, resetToken, resetTokenExpiration) {
    super();
    
    this.id = id;
    this.name = name;
    this.email = email;
    this.imageUrl = imageUrl;
    this.password = password;
    this.resetToken = resetToken;
    this.resetTokenExpiration = resetTokenExpiration;
  }

  async create() {
    try {
      const pool = await getPool();
      
      const sql = "INSERT INTO users (name, email, imageUrl, password) VALUES (?, ?, ?, ?)";

      const values = [
        this.name, 
        this.email,
        this.imageUrl,
        this.password
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
      
      const sql = `UPDATE users SET 
        name = ?, 
        email = ?,
        imageUrl = ?,
        password = ?,
        resetToken = ?,
        resetTokenExpiration = ?
      WHERE id = ?`; 

      const values = [
        this.name, 
        this.email,
        this.imageUrl,
        this.password,
        this.resetToken,
        this.resetTokenExpiration,
        this.id
      ];

      const [ result ] = await pool.execute(sql, values);
      return result;
    } catch(err) {
      throw equipError(err);
    }
  }

  async getEverythingFrom(tableName, limit, offset) {
    try {

      if (typeof tableName !== "string") {
        throw new Error("Название таблицы должно быть строкой");
      }

      const pool = await getPool();

      let sql = `SELECT 
          ${tableName}.*, 
          p.title, 
          p.price,  
          p.imageUrl 
        FROM ${tableName} INNER JOIN products p 
        ON ${tableName}.productId = p.id  
        WHERE ${tableName}.userId = ? 
        ORDER BY ${tableName}.id DESC`;

      if (limit) {
        sql += ` LIMIT ${limit}`;
      }

      if (offset) {
        sql += ` OFFSET ${offset}`;
      }

      const [ results ] = await pool.execute(sql, [this.id]);

      return results;
    } catch(err) {
      throw equipError(err);
    }
  }

  async countItemsInside(tableName) {
    try {

      if (typeof tableName !== "string") {
        throw new Error("Название таблицы должно быть строкой");
      }

      const pool = await getPool();

      const [ rows ] = await pool.execute(`SELECT COUNT (*) FROM ${tableName} WHERE userId = ?`, [this.id]);

      return (rows[0])["COUNT (*)"];
    } catch(err) {
      throw equipError(err);
    }
  }

  async clean(tableName) {
    try {

      if (typeof tableName !== "string") {
        throw new Error("Название таблицы должно быть строкой");
      }

      const pool = await getPool();
      
      const [ result ] = await pool.execute(`DELETE FROM ${tableName} WHERE userId = ?`, [this.id]);

      return result;
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