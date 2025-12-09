const db = require('../config/db');

// Student Profile
exports.getStudentProfile = async (req, res) => {
    try {
        const { user_id } = req.body;
        
        const result = await db.query(`
            SELECT 
                u.user_id,
                u.username,
                u.full_name,
                sg.group_name,
                p.practice_id,
                p.start_date,
                p.end_date,
                pl.location
            FROM student s
            JOIN users u ON s.user_id = u.user_id
            JOIN student_groups sg ON s.group_id = sg.group_id
            JOIN practice p ON s.practice_id = p.practice_id
            JOIN practice_location pl ON p.location_id = pl.location_id
            WHERE u.user_id = $1
        `, [user_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Студент не найден' });
        }

        const profile = result.rows[0];
        
        // Получаем руководителей
        const supervisors = await db.query(`
            SELECT 
                s.supervisor_id,
                s.full_name,
                up.position_name,
                po.organization_name,
                r.role_name
            FROM supervisor s
            JOIN user_position up ON s.position_id = up.position_id
            JOIN practice_organization po ON up.organization_id = po.organization_id
            JOIN roles r ON s.role_id = r.role_id
            WHERE s.practice_id = $1
        `, [profile.practice_id]);

        profile.supervisors = supervisors.rows;
        
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Student Diary - CRUD операции
exports.getStudentDiary = async (req, res) => {
    try {
        const { user_id } = req.body;
        
        const result = await db.query(`
            SELECT 
                wd.entry_id,
                wd.work_date,
                wd.description,
                wd.created_at,
                wd.updated_at
            FROM work_diary wd
            JOIN student s ON wd.student_id = s.student_id
            JOIN users u ON s.user_id = u.user_id
            WHERE u.user_id = $1 AND wd.is_deleted = FALSE
            ORDER BY wd.work_date DESC, wd.created_at DESC
        `, [user_id]);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDiaryEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;
        
        const result = await db.query(`
            SELECT 
                wd.entry_id,
                wd.work_date,
                wd.description,
                wd.created_at,
                wd.updated_at
            FROM work_diary wd
            JOIN student s ON wd.student_id = s.student_id
            JOIN users u ON s.user_id = u.user_id
            WHERE wd.entry_id = $1 AND u.user_id = $2 AND wd.is_deleted = FALSE
        `, [id, user_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Запись не найдена или у вас нет доступа' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addDiaryEntry = async (req, res) => {
    try {
        const { user_id, work_date, description } = req.body;
        
        if (!description || description.trim().length === 0) {
            return res.status(400).json({ error: 'Описание не может быть пустым' });
        }

        // Находим student_id по user_id
        const studentResult = await db.query(
            'SELECT student_id FROM student WHERE user_id = $1',
            [user_id]
        );

        if (studentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Студент не найден' });
        }

        const student_id = studentResult.rows[0].student_id;

        const insertResult = await db.query(
            `INSERT INTO work_diary (student_id, work_date, description) 
             VALUES ($1, $2, $3) 
             RETURNING entry_id, work_date, description, created_at`,
            [student_id, work_date || new Date(), description.trim()]
        );

        res.json({ 
            success: true, 
            message: 'Запись успешно добавлена',
            entry: insertResult.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateDiaryEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, work_date, description } = req.body;
        
        if (!description || description.trim().length === 0) {
            return res.status(400).json({ error: 'Описание не может быть пустым' });
        }

        // Проверяем, что запись принадлежит студенту
        const checkResult = await db.query(`
            SELECT wd.entry_id 
            FROM work_diary wd
            JOIN student s ON wd.student_id = s.student_id
            WHERE wd.entry_id = $1 AND s.user_id = $2 AND wd.is_deleted = FALSE
        `, [id, user_id]);

        if (checkResult.rows.length === 0) {
            return res.status(403).json({ error: 'Запись не найдена или у вас нет прав на редактирование' });
        }

        const updateResult = await db.query(
            `UPDATE work_diary 
             SET work_date = $1, description = $2, updated_at = CURRENT_TIMESTAMP
             WHERE entry_id = $3 AND is_deleted = FALSE
             RETURNING entry_id, work_date, description, created_at, updated_at`,
            [work_date, description.trim(), id]
        );

        if (updateResult.rows.length === 0) {
            return res.status(404).json({ error: 'Запись не найдена' });
        }

        res.json({ 
            success: true, 
            message: 'Запись успешно обновлена',
            entry: updateResult.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteDiaryEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;
        
        // Проверяем, что запись принадлежит студенту
        const checkResult = await db.query(`
            SELECT wd.entry_id 
            FROM work_diary wd
            JOIN student s ON wd.student_id = s.student_id
            WHERE wd.entry_id = $1 AND s.user_id = $2 AND wd.is_deleted = FALSE
        `, [id, user_id]);

        if (checkResult.rows.length === 0) {
            return res.status(403).json({ error: 'Запись не найдена или у вас нет прав на удаление' });
        }

        // Мягкое удаление (помечаем как удаленное)
        const deleteResult = await db.query(
            `UPDATE work_diary 
             SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP
             WHERE entry_id = $1
             RETURNING entry_id`,
            [id]
        );

        if (deleteResult.rows.length === 0) {
            return res.status(404).json({ error: 'Запись не найдена' });
        }

        res.json({ 
            success: true, 
            message: 'Запись успешно удалена'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Individual Works - CRUD операции
exports.getIndividualWorks = async (req, res) => {
    try {
        const { user_id } = req.body;
        
        const result = await db.query(`
            SELECT 
                iw.individual_work_id,
                iw.issue_date,
                iw.work_description,
                iw.issue_deadline,
                iw.complete_mark,
                iw.created_at,
                iw.updated_at
            FROM individual_work iw
            JOIN student s ON iw.student_id = s.student_id
            JOIN users u ON s.user_id = u.user_id
            WHERE u.user_id = $1 AND iw.is_deleted = FALSE
            ORDER BY iw.issue_date DESC, iw.created_at DESC
        `, [user_id]);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getIndividualWork = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;
        
        const result = await db.query(`
            SELECT 
                iw.individual_work_id,
                iw.issue_date,
                iw.work_description,
                iw.issue_deadline,
                iw.complete_mark,
                iw.created_at,
                iw.updated_at
            FROM individual_work iw
            JOIN student s ON iw.student_id = s.student_id
            JOIN users u ON s.user_id = u.user_id
            WHERE iw.individual_work_id = $1 AND u.user_id = $2 AND iw.is_deleted = FALSE
        `, [id, user_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Задание не найдено или у вас нет доступа' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addIndividualWork = async (req, res) => {
    try {
        const { user_id, issue_date, work_description, issue_deadline, complete_mark } = req.body;
        
        if (!work_description || work_description.trim().length === 0) {
            return res.status(400).json({ error: 'Описание задания не может быть пустым' });
        }

        if (!issue_date) {
            return res.status(400).json({ error: 'Дата выдачи обязательна' });
        }

        if (!issue_deadline) {
            return res.status(400).json({ error: 'Срок выполнения обязателен' });
        }

        // Находим student_id по user_id
        const studentResult = await db.query(
            'SELECT student_id FROM student WHERE user_id = $1',
            [user_id]
        );

        if (studentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Студент не найден' });
        }

        const student_id = studentResult.rows[0].student_id;

        const insertResult = await db.query(
            `INSERT INTO individual_work (student_id, issue_date, work_description, issue_deadline, complete_mark) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING individual_work_id, issue_date, work_description, issue_deadline, complete_mark, created_at`,
            [student_id, issue_date, work_description.trim(), issue_deadline, complete_mark || false]
        );

        res.json({ 
            success: true, 
            message: 'Задание успешно добавлено',
            work: insertResult.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateIndividualWork = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, issue_date, work_description, issue_deadline, complete_mark } = req.body;
        
        // Проверяем, что задание принадлежит студенту
        const checkResult = await db.query(`
            SELECT iw.individual_work_id 
            FROM individual_work iw
            JOIN student s ON iw.student_id = s.student_id
            WHERE iw.individual_work_id = $1 AND s.user_id = $2 AND iw.is_deleted = FALSE
        `, [id, user_id]);

        if (checkResult.rows.length === 0) {
            return res.status(403).json({ error: 'Задание не найдено или у вас нет прав на редактирование' });
        }

        // Подготавливаем данные для обновления
        const updateFields = [];
        const updateValues = [];
        let paramIndex = 1;

        if (issue_date !== undefined) {
            updateFields.push(`issue_date = $${paramIndex}`);
            updateValues.push(issue_date);
            paramIndex++;
        }

        if (work_description !== undefined) {
            if (work_description.trim().length === 0) {
                return res.status(400).json({ error: 'Описание задания не может быть пустым' });
            }
            updateFields.push(`work_description = $${paramIndex}`);
            updateValues.push(work_description.trim());
            paramIndex++;
        }

        if (issue_deadline !== undefined) {
            updateFields.push(`issue_deadline = $${paramIndex}`);
            updateValues.push(issue_deadline);
            paramIndex++;
        }

        if (complete_mark !== undefined) {
            updateFields.push(`complete_mark = $${paramIndex}`);
            updateValues.push(complete_mark);
            paramIndex++;
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'Нет данных для обновления' });
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        updateValues.push(id);

        const query = `
            UPDATE individual_work 
            SET ${updateFields.join(', ')}
            WHERE individual_work_id = $${paramIndex} AND is_deleted = FALSE
            RETURNING individual_work_id, issue_date, work_description, issue_deadline, complete_mark, created_at, updated_at
        `;

        const updateResult = await db.query(query, updateValues);

        if (updateResult.rows.length === 0) {
            return res.status(404).json({ error: 'Задание не найдено' });
        }

        res.json({ 
            success: true, 
            message: 'Задание успешно обновлено',
            work: updateResult.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteIndividualWork = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;
        
        // Проверяем, что задание принадлежит студенту
        const checkResult = await db.query(`
            SELECT iw.individual_work_id 
            FROM individual_work iw
            JOIN student s ON iw.student_id = s.student_id
            WHERE iw.individual_work_id = $1 AND s.user_id = $2 AND iw.is_deleted = FALSE
        `, [id, user_id]);

        if (checkResult.rows.length === 0) {
            return res.status(403).json({ error: 'Задание не найдено или у вас нет прав на удаление' });
        }

        // Мягкое удаление
        const deleteResult = await db.query(
            `UPDATE individual_work 
             SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP
             WHERE individual_work_id = $1
             RETURNING individual_work_id`,
            [id]
        );

        if (deleteResult.rows.length === 0) {
            return res.status(404).json({ error: 'Задание не найдено' });
        }

        res.json({ 
            success: true, 
            message: 'Задание успешно удалено'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};