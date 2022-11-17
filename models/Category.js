import BaseModel from "./BaseModel.js";
import { getPool } from "../utils/db.js";
import equipError from "../utils/equipError.js";

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

      return pool.execute(sql, values);
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

      return pool.execute(sql, values);
    } catch(err) {
      throw equipError(err);
    }
  }
};