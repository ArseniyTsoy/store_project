import { getPool } from "../utils/db.js";

export default class User {

  constructor(id, name, email, imageUrl, password, resetToken, resetTokenExpiration) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.imageUrl = imageUrl;
    this.password = password;
    this.resetToken = resetToken;
    this.resetTokenExpiration = resetTokenExpiration;
  }

  create() {
    const pool = getPool();
    
    const sql = "INSERT INTO users (name, email, imageUrl, password) VALUES (?, ?, ?, ?)";
    const values = [
      this.name, 
      this.email,
      this.imageUrl,
      this.password
    ];

    return pool.execute(sql, values);
  }

  updateAll() {
    const pool = getPool();
    
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
  }

  updateField(fieldName) {
    // Проверка на строку
    if (!fieldName) {
      throw new Error("Поле не указано!");
    }

    const pool = getPool();
      
    const sql = `UPDATE users SET ${fieldName} = ? WHERE id = ?`; 

    const values = [this[fieldName], this.id];

    return pool.execute(sql, values);
  }

  static findById(userId) {
    const pool = getPool();

    return pool.execute("SELECT * FROM users WHERE id = ?", [userId]);
  }

  static findOne(field, value) {
    const pool = getPool();
    
    const sql = `SELECT * FROM users WHERE ${field} = ?`;
    return pool.execute(sql, [value]);
  }

  static deleteById(userId) {
    const pool = getPool();

    return pool.execute("DELETE FROM users WHERE id = ?", [userId]); 
  }

  static findAll() {
    const pool = getPool();

    return pool.execute("SELECT * FROM users ORDER BY id DESC");
  }

  getCart() {
    const pool = getPool();

    const sql = `SELECT 
        cart.id,
        cart.user_id, 
        cart.product_id, 
        p.title, 
        p.price, 
        cart.quantity, 
        p.imageUrl 
      FROM cart INNER JOIN products p 
      ON cart.product_id = p.id  
      WHERE cart.user_id = ?`;

    return pool.execute(sql, [this.id]);
  }

  countCart() {
    const pool = getPool();

    return pool.execute("SELECT COUNT (*) FROM cart WHERE user_id = ?", [this.id]);
  }

  static async addToCart(userId, productId, quantity) {
    try {
      const pool = getPool();
      let sql;
      let values;
      let newItemAdded;
            
      const [ rows ] = await pool.execute("SELECT * FROM cart WHERE user_id = ? AND product_id = ?", [userId, productId]);

      const alreadyInCart = rows[0];

      if (!alreadyInCart) {
        sql = `INSERT INTO cart (
          user_id, 
          product_id, 
          quantity
          ) VALUES (?, ?, ?)`;

        values = [
          userId, 
          productId, 
          quantity
        ];

        newItemAdded = true;
      } else {
        const newQuantity = alreadyInCart.quantity + quantity;

        sql = "UPDATE cart SET quantity = ? WHERE id = ?";

        values = [
          newQuantity, 
          alreadyInCart.id
        ];

        newItemAdded = false;
      }

      await pool.execute(sql, values);
      return newItemAdded;
    } catch(err) {
      throw new Error(err);
    }
  }

  static changeQty(newQty, itemId) {
    const pool = getPool();
    return pool.execute("UPDATE cart SET quantity = ? WHERE id = ?", [newQty, itemId]);
  }

  static deleteFromCart(itemId) {
    const pool = getPool();

    return pool.execute("DELETE FROM cart WHERE id = ?", [itemId]);
  }

  cleanCart() {
    const pool = getPool();
    return pool.execute("DELETE FROM cart WHERE user_id = ?", [this.id]);
  }

  getWishlist() {
    const pool = getPool();
    
    const sql = `SELECT 
        w.id,
        w.user_id,
        w.product_id,
        p.title,
        p.price,
        p.imageUrl
      FROM wishlist w INNER JOIN products p
      ON w.product_id = p.id
      WHERE w.user_id = ?`;

    return pool.execute(sql, [this.id]);
  }

  countWishlist() {
    const pool = getPool();
    return pool.execute("SELECT COUNT (*) FROM wishlist WHERE user_id = ?", [this.id]);
  }

  static async addToWishlist(userId, productId) {
    try {
      const pool = getPool();
      let sql;
      let values;
      let newItemAdded;

      const [ rows ] = await pool.execute("SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?", [userId, productId]);
      
      const alreadyInWishlist = rows[0];
      
      if (!alreadyInWishlist) {
        sql = `INSERT INTO wishlist (
          user_id, 
          product_id
        ) VALUES (?, ?)`;

        values = [
          userId, 
          productId
        ];

        await pool.execute(sql, values);

        newItemAdded = true;
        return newItemAdded;
      } else {
        console.log("Already in wishlist");
        newItemAdded = false;
        return newItemAdded;
      }
    } catch(err) {
      throw new Error(err);
    }
  }

  static deleteFromWishlist(itemId) {
    const pool = getPool();
    return pool.execute("DELETE FROM wishlist WHERE id = ?", [itemId]);
  }

  cleanWishlist() {
    const pool = getPool();
    return pool.execute("DELETE FROM wishlist WHERE user_id = ?", [this.id]);
  }
};