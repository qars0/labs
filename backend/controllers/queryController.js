const db = require('../config/db');

// === 4 ПРОСТЫХ ЗАПРОСА ===

// 1. Получить всех пользователей
exports.getAllUsers = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users ORDER BY user_id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Получить все практики
exports.getAllPractices = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM practice ORDER BY start_date');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Получить всех студентов с их группами
exports.getAllStudentsWithGroups = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.student_id, u.full_name, g.group_name, p.start_date, p.end_date
      FROM student s
      JOIN users u ON s.user_id = u.user_id
      JOIN student_groups g ON s.group_id = g.group_id
      JOIN practice p ON s.practice_id = p.practice_id
      ORDER BY s.student_id
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Получить все записи в дневнике
exports.getAllDiaryEntries = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM work_diary ORDER BY work_date DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// === 2 ЗАПРОСА С ПОДЗАПРОСОМ ===

// 5. Пользователи, которые являются администраторами
exports.getAdminUsers = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.* 
      FROM users u 
      WHERE u.user_id IN (SELECT user_id FROM admin_users)
      ORDER BY u.user_id
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 6. Студенты с записями в дневнике за последние 7 дней
exports.getStudentsWithRecentDiary = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT DISTINCT s.student_id, u.full_name, g.group_name
      FROM student s
      JOIN users u ON s.user_id = u.user_id
      JOIN student_groups g ON s.group_id = g.group_id
      WHERE s.student_id IN (
        SELECT student_id 
        FROM work_diary 
        WHERE work_date >= CURRENT_DATE - INTERVAL '7 days'
      )
      ORDER BY u.full_name
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// === 2 ЗАПРОСА С JOIN ===

// 7. Студенты с их практиками и местами проведения
exports.getStudentsWithPracticeLocation = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        u.full_name,
        g.group_name,
        p.start_date,
        p.end_date,
        pl.location
      FROM student s
      JOIN users u ON s.user_id = u.user_id
      JOIN student_groups g ON s.group_id = g.group_id
      JOIN practice p ON s.practice_id = p.practice_id
      JOIN practice_location pl ON p.location_id = pl.location_id
      ORDER BY p.start_date, u.full_name
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 8. Руководители практики с их ролями и организациями
exports.getSupervisorsWithDetails = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        s.full_name,
        r.role_name,
        po.organization_name,
        up.position_name
      FROM supervisor s
      JOIN roles r ON s.role_id = r.role_id
      JOIN user_position up ON s.position_id = up.position_id
      JOIN practice_organization po ON up.organization_id = po.organization_id
      ORDER BY s.full_name
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// === 2 ЗАПРОСА К ПРЕДСТАВЛЕНИЯМ ===
// Сначала создадим представления в базе данных

// Представление 1: Студенты и их группы
exports.createStudentGroupsView = async (req, res) => {
  try {
    await db.query(`
      CREATE OR REPLACE VIEW student_groups_view AS
      SELECT 
        s.student_id,
        u.full_name,
        g.group_name,
        p.practice_id,
        p.start_date,
        p.end_date
      FROM student s
      JOIN users u ON s.user_id = u.user_id
      JOIN student_groups g ON s.group_id = g.group_id
      JOIN practice p ON s.practice_id = p.practice_id
    `);
    res.json({ message: 'Представление student_groups_view создано/обновлено' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 9. Запрос к представлению студентов и групп
exports.getStudentGroupsView = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM student_groups_view ORDER BY full_name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Представление 2: Практики с количеством студентов
exports.createPracticeStudentsView = async (req, res) => {
  try {
    await db.query(`
      CREATE OR REPLACE VIEW practice_students_view AS
      SELECT 
        p.practice_id,
        p.start_date,
        p.end_date,
        pl.location,
        COUNT(s.student_id) as student_count
      FROM practice p
      LEFT JOIN student s ON p.practice_id = s.practice_id
      JOIN practice_location pl ON p.location_id = pl.location_id
      GROUP BY p.practice_id, p.start_date, p.end_date, pl.location
    `);
    res.json({ message: 'Представление practice_students_view создано/обновлено' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 10. Запрос к представлению практик с количеством студентов
exports.getPracticeStudentsView = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM practice_students_view ORDER BY start_date');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// === ДИНАМИЧЕСКИЙ ЗАПРОС ===

// 11. Динамический запрос (только SELECT для безопасности)
exports.executeDynamicQuery = async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Требуется SQL-запрос' });
    }
    
    // Проверяем, что запрос начинается с SELECT (только для чтения)
    const trimmedQuery = query.trim().toUpperCase();
    if (!trimmedQuery.startsWith('SELECT')) {
      return res.status(403).json({ 
        error: 'Разрешены только SELECT запросы в целях безопасности' 
      });
    }
    
    const result = await db.query(query);
    res.json({
      success: true,
      rows: result.rows,
      rowCount: result.rowCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// === ФУНКЦИИ ===

// 12. Функция: количество студентов на практике
exports.getStudentsCountOnPractice = async (req, res) => {
  try {
    const { practice_id } = req.params;
    const result = await db.query(
      'SELECT get_students_count($1) as student_count',
      [practice_id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 13. Функция: среднее количество записей в дневнике на студента
exports.getAvgDiaryEntries = async (req, res) => {
  try {
    const result = await db.query('SELECT get_avg_diary_entries() as avg_entries');
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// === ПРОЦЕДУРЫ ===

// 14. Процедура: добавить студента
exports.addStudentProcedure = async (req, res) => {
  try {
    const { username, password, full_name, group_id, practice_id } = req.body;
    
    await db.query(
      'CALL add_student($1, $2, $3, $4, $5)',
      [username, password, full_name, group_id, practice_id]
    );
    
    res.json({ 
      success: true, 
      message: 'Студент успешно добавлен'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 15. Процедура: закрыть практику
exports.closePracticeProcedure = async (req, res) => {
  try {
    const { practice_id, end_date } = req.body;
    
    await db.query(
      'CALL close_practice($1, $2)',
      [practice_id, end_date]
    );
    
    res.json({ 
      success: true, 
      message: 'Практика успешно закрыта'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// === ТРАНЗАКЦИИ ===

// 16. Транзакция: переместить студента в другую группу
exports.moveStudentTransaction = async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { student_id, new_group_id } = req.body;
    
    // Обновляем группу студента
    await client.query(
      'UPDATE student SET group_id = $1 WHERE student_id = $2',
      [new_group_id, student_id]
    );
    
    // Записываем в лог
    await client.query(
      'INSERT INTO work_diary (student_id, work_date, description) VALUES ($1, CURRENT_DATE, $2)',
      [student_id, `Студент переведен в группу ID: ${new_group_id}`]
    );
    
    await client.query('COMMIT');
    
    res.json({ 
      success: true, 
      message: 'Студент успешно перемещен в другую группу' 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

// 17. Транзакция: удалить студента и связанные записи
exports.deleteStudentTransaction = async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { student_id } = req.body;
    
    // Удаляем индивидуальные работы
    await client.query(
      'DELETE FROM individual_work WHERE student_id = $1',
      [student_id]
    );
    
    // Удаляем записи в дневнике
    await client.query(
      'DELETE FROM work_diary WHERE student_id = $1',
      [student_id]
    );
    
    // Удаляем студента
    await client.query(
      'DELETE FROM student WHERE student_id = $1',
      [student_id]
    );
    
    await client.query('COMMIT');
    
    res.json({ 
      success: true, 
      message: 'Студент и связанные записи успешно удалены' 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

module.exports = exports;