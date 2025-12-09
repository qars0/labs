const { Pool } = require('pg');
require('dotenv').config();

console.log('=== НАСТРОЙКИ БАЗЫ ДАННЫХ ===');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'НЕ УСТАНОВЛЕН');

const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_NAME || 'mydatabase',
  password: process.env.DB_PASSWORD || 'admin123',
  port: process.env.DB_PORT || 5432,
  connectionTimeoutMillis: 5000, // Таймаут подключения
  idleTimeoutMillis: 30000,
});

// Обработчики событий
pool.on('connect', () => {
  console.log('✅ Новое подключение к PostgreSQL создано');
});

pool.on('error', (err) => {
  console.error('❌ Неожиданная ошибка на клиенте PostgreSQL:', err.message);
  console.error('Stack:', err.stack);
});

const query = async (text, params) => {
  console.log(`📝 SQL запрос: ${text}`);
  if (params) console.log('Параметры:', params);
  
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`✅ Запрос выполнен за ${duration}мс, строк: ${result.rowCount}`);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`❌ Ошибка SQL за ${duration}мс:`, error.message);
    console.error('SQL текст:', text);
    throw error;
  }
};

module.exports = {
  query,
  pool
};