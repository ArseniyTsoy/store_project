import mysql from "mysql2/promise";
let _pool;

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
    console.log("Pool is ready!");
    _pool = newPool;
    cb();
  } catch(err) {
    throw new Error(err);
  }
}

export function getPool() {
  if (_pool) {
    return _pool;
  } else {
    throw new Error("No established pool found!");
  }
}