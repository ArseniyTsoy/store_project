import mysql from "mysql2/promise";
let _pool;
import equipError from "./equipError.js";

export async function poolConnect(cb) {
  try {
    const newPool = await mysql.createPool({
      host: process.env.DBHOST,
      user: process.env.DBUSER,
      database: process.env.DBNAME,
      password: process.env.DBPASS,
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