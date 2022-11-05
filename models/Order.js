import { getPool } from "../util/db.js";

export default class Order {

  constructor(id, user_id, name, phone, email, method, address, content, total_price, placed_on) {
    this.id = id;
    this.user_id = user_id;
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.method = method;
    this.address = address;
    this.content = content;
    this.total_price = total_price;
    this.placed_on = placed_on;
  }

  async create() {
    try {
      const pool = await getPool();

      const sql = `INSERT INTO orders (
        user_id, 
        name,
        phone, 
        email, 
        method,
        address,
        content,
        total_price, 
        placed_on
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const values = [
        this.user_id,
        this.name,
        this.phone,
        this.email,
        this.method,
        this.address,
        this.content,
        this.total_price,
        this.placed_on
      ];

      return pool.execute(sql, values);
    } catch(err) {
      throw new Error(err);
    }
  }

  static async findByUser(userId) {
    try {
      const pool = await getPool();

      return pool.execute("SELECT * FROM orders WHERE user_id = ?", [userId]);
      
    } catch(err) {
      throw new Error(err);
    }
  }

  static async findAll() {
    try {
      const pool = await getPool();

      return pool.execute("SELECT * FROM orders");
    } catch(err) {
      throw new Error(err);
    }
  }
};