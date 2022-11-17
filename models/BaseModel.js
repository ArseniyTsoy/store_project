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

  static async findById(tableName, id) {
    try {

      if (typeof tableName !== "string") {
        throw new Error("Wrong argument type for the table name! A string is required!");
      }

      const pool = await getPool();

      return pool.execute(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
    } catch(err) {
      throw equipError(err);
    }
  }

  static async findByField(tableName, fieldName, value) {
    try {

      if (typeof tableName !== "string" || typeof fieldName !== "string") {
        throw new Error("Wrong argument type! A string is required!");
      }

      const pool = await getPool();
      
      return pool.execute(`SELECT * FROM ${tableName} WHERE ${fieldName} = ? ORDER BY id DESC`, [value]);
    } catch(err) {
      throw equipError(err);
    }
  }

  static async findAll(tableName) {
    try {
      
      if (typeof tableName !== "string") {
        throw new Error("Wrong argument type for the table name! A string is required!");
      }

      const pool = await getPool();
      
      return pool.execute(`SELECT * FROM ${tableName} ORDER BY id DESC`);
    } catch(err) {
      throw equipError(err);
    }
  }

  static async deleteById(tableName, id) {
    try {

      if (typeof tableName !== "string") {
        throw new Error("Wrong argument type for the table name! A string is required!");
      }

      const pool = await getPool();

      return pool.execute(`DELETE FROM ${tableName} WHERE id =?`, [id]);
    } catch(err) {
      throw equipError(err);
    }
  }
};