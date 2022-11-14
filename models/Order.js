import BaseModel from "./BaseModel.js";
import { getPool } from "../utils/db.js";

export default class Order extends BaseModel {

  constructor(id, userId, name, phone, email, method, address, content, totalPrice, dateCreated) {
    super();
    
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.method = method;
    this.address = address;
    this.content = content;
    this.totalPrice = totalPrice;
    this.dateCreated = dateCreated;
  }

  async create() {
    try {
      const pool = await getPool();

      const sql = `INSERT INTO orders (
        userId, 
        name,
        phone, 
        email, 
        method,
        address,
        content,
        totalPrice, 
        dateCreated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const values = [
        this.userId,
        this.name,
        this.phone,
        this.email,
        this.method,
        this.address,
        this.content,
        this.totalPrice,
        this.dateCreated
      ];

      return pool.execute(sql, values);
    } catch(err) {
      throw new Error(err);
    }
  }

  async update() {
    try {
      const pool = await getPool();

      const sql = `UPDATE orders SET 
          name = ?,
          phone = ?,
          email = ?,
          method = ?,
          address = ?
        WHERE id = ?`;

      const values = [
        this.name,
        this.phone,
        this.email,
        this.method,
        this.address,
        this.id
      ];
      
      return pool.execute(sql, values);
    } catch(err) {
      throw new Error(err);
    }
  }
};