const db = require('../config/db');


exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Требуется имя пользователя и пароль' });
    }

    const result = await db.query(
      'SELECT user_id, username, full_name FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }

    const user = result.rows[0];
    
    // Проверяем, является ли пользователь администратором
    const adminResult = await db.query(
      'SELECT admin_id FROM admin_users WHERE user_id = $1',
      [user.user_id]
    );

    const isAdmin = adminResult.rows.length > 0;
    
    res.json({
      success: true,
      user: {
        id: user.user_id,
        username: user.username,
        fullName: user.full_name,
        isAdmin: isAdmin
      }
    });
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Проверка авторизации
exports.checkAuth = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Требуется ID пользователя' });
    }

    const result = await db.query(
      'SELECT user_id, username, full_name FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const user = result.rows[0];
    
    // Проверяем, является ли пользователь администратором
    const adminResult = await db.query(
      'SELECT admin_id FROM admin_users WHERE user_id = $1',
      [user.user_id]
    );

    const isAdmin = adminResult.rows.length > 0;
    
    res.json({
      success: true,
      user: {
        id: user.user_id,
        username: user.username,
        fullName: user.full_name,
        isAdmin: isAdmin
      }
    });
  } catch (error) {
    console.error('Ошибка проверки авторизации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = exports;