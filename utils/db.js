import mysql from "mysql2/promise";
let _pool;
import equipError from "./equipError.js";

export async function poolConnect(cb) {
  try {
    const newPool = await mysql.createPool({
      host: process.env.HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    _pool = newPool;
    cb();
  } catch(err) {
    throw equipError(err);
  }
}

export function getPool() {
  return new Promise(function(resolve, reject) {
    if (_pool) {
      resolve(_pool);
    } else {
      reject(new Error("No established pool found!"));
    }
  });
}