import BaseModel from "./BaseModel.js";
import { getPool } from "../utils/db.js";

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

      return pool.execute(sql, values);
    } catch(err) {
      throw new Error(err);
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

      return pool.execute(sql, values);
    } catch(err) {
      throw new Error(err);
    }
  }

  // async updateField(fieldName) {
  //   try {
  //     // Проверка на строку
  //     if (!fieldName) {
  //       throw new Error("Поле не указано!");
  //     }

  //     const pool = await getPool();
        
  //     const sql = `UPDATE users SET ${fieldName} = ? WHERE id = ?`; 

  //     const values = [this[fieldName], this.id];

  //     return pool.execute(sql, values);
  //   } catch(err) {
  //     throw new Error(err);
  //   }
  // }

  async getEverythingFrom(tableName) {
    try {

      if (typeof tableName !== "string") {
        throw new Error(err);
      }

      const pool = await getPool();

      const sql = `SELECT 
          ${tableName}.*, 
          p.title, 
          p.price,  
          p.imageUrl 
        FROM ${tableName} INNER JOIN products p 
        ON ${tableName}.productId = p.id  
        WHERE ${tableName}.userId = ? 
        ORDER BY ${tableName}.id DESC`;

      return pool.execute(sql, [this.id]);
    } catch(err) {
      throw new Error(err);
    }
  }

  async countItemsInside(tableName) {
    try {

      if (typeof tableName !== "string") {
        throw new Error("Wrong type!");
      }

      const pool = await getPool();

      return pool.execute(`SELECT COUNT (*) FROM ${tableName} WHERE userId = ?`, [this.id]);
    } catch(err) {
      throw new Error(err);
    }
  }

  async clean(tableName) {
    try {

      if (typeof tableName !== "string") {
        throw new Error("Wrong type!");
      }

      const pool = await getPool();
      
      return pool.execute(`DELETE FROM ${tableName} WHERE userId = ?`, [this.id]);

    } catch(err) {
      throw new Error(err);
    }
  }
};