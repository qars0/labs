const { Pool } = require('pg');
require('dotenv').config();

console.log('=== НАСТРОЙКИ БАЗЫ ДАННЫХ ===');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'не установлен');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_NAME || 'practice_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Функция для выполнения запросов с параметрами
const query = (text, params) => pool.query(text, params);

// Функция для выполнения простых запросов
const simpleQuery = async (text) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text);
    return result.rows;
  } finally {
    client.release();
  }
};

module.exports = {
  query,
  simpleQuery,
  pool
};