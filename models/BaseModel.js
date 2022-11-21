import { getPool } from "../utils/db.js";
import equipError from "../utils/equipError.js";

export default class BaseModel {
  static async count(tableName) {
    try {
      
      if (typeof tableName !== "string") {
        throw new Error("Wrong argument type for the table name! A string is required!");
      }

      const pool = await getPool();
      const sql = `SELECT COUNT (*) FROM ${tableName}`;

      const [ rows ] = await pool.query(sql);

      return (rows[0])["COUNT (*)"];
    } catch(err) {
      throw equipError(err);
    }
  }

  static async countByField(fieldName, fieldValue, tableName) {
    try {
      
      if (typeof tableName !== "string") {
        throw new Error("Wrong argument type for the table name! A string is required!");
      }

      const pool = await getPool();
     
      const sql = `SELECT COUNT (*) FROM ${tableName} WHERE ${fieldName} = ?`;

      const [ rows ] = await pool.execute(sql, [fieldValue]);

      return (rows[0])["COUNT (*)"];
    } catch(err) {
      throw equipError(err);
    }
  }

  static async findById(id, tableName) {
    try {

      if (typeof tableName !== "string") {
        throw new Error("Wrong argument type for the table name! A string is required!");
      }

      const pool = await getPool();

      const [ result ] = await pool.execute(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);

      return result[0];

    } catch(err) {
      throw equipError(err);
    }
  }

  static async findByField(fieldName, fieldValue, limit = null, offset = null, tableName) {
    try {

      if (typeof tableName !== "string" || typeof fieldName !== "string") {
        throw new Error("Wrong argument type! A string is required!");
      }

      const pool = await getPool();

      let sql = `SELECT * FROM ${tableName} WHERE ${fieldName} = ? ORDER BY id DESC`;

      if (limit) {
        sql += ` LIMIT ${limit}`;
      }

      if (offset) {
        sql += ` OFFSET ${offset}`;
      }
      
      const [ results ] = await pool.execute(sql, [fieldValue]);

      return results;

    } catch(err) {
      throw equipError(err);
    }
  }

  static async findAll(limit = null, offset = null, tableName) {
    
    try {

      if (typeof tableName !== "string") {
        throw new Error("Wrong argument type for the table name! A string is required!");
      }

      let sql = `SELECT * FROM ${tableName} ORDER BY id DESC`;

      if (limit) {
        sql += ` LIMIT ${limit}`;
      } 

      if (offset) {
        sql += ` OFFSET ${offset}`;
      } 

      const pool = await getPool();
      
      const [ results ] = await pool.execute(sql);

      return results;
      
    } catch(err) {
      throw equipError(err);
    }
  }

  static async deleteById(id, tableName) {
    try {

      if (typeof tableName !== "string") {
        throw new Error("Wrong argument type for the table name! A string is required!");
      }

      const pool = await getPool();

      const result = await pool.execute(`DELETE FROM ${tableName} WHERE id = ?`, [id]);

      return result;
      
    } catch(err) {
      throw equipError(err);
    }
  }
};