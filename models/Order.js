import { getPool } from "../utils/db.js";

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

  create() {
    const pool = getPool();

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
  }

  static findByUser(userId) {
    const pool = getPool();
    return pool.execute("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC", [userId]);
  }

  static findAll() {
    const pool = getPool();
    return pool.execute("SELECT * FROM orders ORDER BY id DESC");
  }

  static deleteById(orderId) {
    const pool = getPool();
    return pool.execute("DELETE FROM orders WHERE id = ?", [orderId]); 
  }
};