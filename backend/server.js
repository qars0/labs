const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.BACKEND_PORT || 3000;

// Middleware
app.use(cors({origin: '*'}));
app.use(express.json());

// Подключаем маршруты
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Простой тестовый маршрут
app.get('/', (req, res) => {
  res.json({ 
    message: 'Система управления практиками',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/login',
      queries: '/api/queries/*',
      functions: '/api/functions/*',
      procedures: '/api/procedures/*',
      transactions: '/api/transactions/*'
    }
  });
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
  console.log(`API доступен по адресу: http://localhost:${port}/api`);
});

app.get('/api/test-db', async (req, res) => {
  try {
    console.log('=== ТЕСТ ПОДКЛЮЧЕНИЯ К БД ===');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_PORT:', process.env.DB_PORT);
    
    const db = require('./config/db');
    
    // Простой запрос для проверки
    console.log('Выполняем запрос...');
    const result = await db.query('SELECT NOW() as current_time');
    
    console.log('✅ Запрос выполнен успешно');
    res.json({ 
      success: true, 
      message: '✅ База данных работает!',
      database_time: result.rows[0].current_time,
      env_info: {
        db_host: process.env.DB_HOST,
        db_user: process.env.DB_USER,
        db_name: process.env.DB_NAME
      }
    });
    
  } catch (error) {
    console.error('❌ ОШИБКА ПОДКЛЮЧЕНИЯ К БД:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: {
        db_host: process.env.DB_HOST,
        db_user: process.env.DB_USER,
        db_name: process.env.DB_NAME,
        db_port: process.env.DB_PORT,
        suggestion: 'Проверьте: 1) Запущен ли PostgreSQL 2) Правильные ли credentials'
      }
    });
  }
});