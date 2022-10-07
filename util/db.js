const mysql = require("mysql2");
let _pool;

async function poolConnect(cb) {
  try {
    const newPool = await mysql.createPool({
      host: "localhost",
      user: "root",
      database: "grocery_store",
      password: "RhfqPrincess3081<",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    _pool = newPool.promise();
    console.log("Pool is ready!");
    cb();
  } catch(err) {
    throw new Error(err);
  }
}

function getPool() {
  if (_pool) {
    return _pool;
  } else {
    throw new Error("No established pool found!");
  }
}

module.exports = {
  poolConnect: poolConnect,
  getPool: getPool
};