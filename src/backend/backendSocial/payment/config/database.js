import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg;

dotenv.config();

//--------------- Database Configuration ---------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Render PostgreSQL
  },
});

//--------------- Test Connection ---------------
pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle client", err);
  process.exit(-1);
});

//--------------- Query Helper Function ---------------
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("📊 Executed query", { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error("❌ Query error:", error);
    throw error;
  }
};

//--------------- Get Client for Transactions ---------------
export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

export default pool;
