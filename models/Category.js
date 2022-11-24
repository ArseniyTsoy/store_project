import BaseModel from "./BaseModel.js";
import { getPool } from "../utils/db.js";
import equipError from "../utils/equipError.js";

const TABLE_NAME = "categories";

export default class Category extends BaseModel {
  constructor(id, title, description, imageUrl) {
    super();
    
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

      const [ result ] = await pool.execute(sql, values);
      return result;
    } catch(err) {
      throw equipError(err);
    }
  }

  async update() {
    try {
      const pool = await getPool();

      const sql = `UPDATE categories SET
          title = ?,
          description = ?,
          imageUrl = ? 
        WHERE id = ?`;

      const values = [this.title, this.description, this.imageUrl, this.id];

      const [ result ] = await pool.execute(sql, values);
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