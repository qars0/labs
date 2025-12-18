const db = require('../config/db');

// ===== CRUD ДЛЯ PRACTICE_LOCATION =====
exports.getLocations = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM practice_location ORDER BY location_id');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createLocation = async (req, res) => {
    try {
        const { location } = req.body;
        
        if (!location || location.trim().length === 0) {
            return res.status(400).json({ error: 'Название локации обязательно' });
        }

        const result = await db.query(
            'INSERT INTO practice_location (location) VALUES ($1) RETURNING *',
            [location.trim()]
        );

        res.json({ 
            success: true, 
            message: 'Локация успешно создана',
            location: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { location } = req.body;
        
        if (!location || location.trim().length === 0) {
            return res.status(400).json({ error: 'Название локации обязательно' });
        }

        const result = await db.query(
            'UPDATE practice_location SET location = $1 WHERE location_id = $2 RETURNING *',
            [location.trim(), id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Локация не найдена' });
        }

        res.json({ 
            success: true, 
            message: 'Локация успешно обновлена',
            location: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;

        // Проверяем, используется ли локация в таблице practice
        const checkResult = await db.query(
            'SELECT practice_id FROM practice WHERE location_id = $1',
            [id]
        );

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ 
                error: 'Невозможно удалить локацию, так как она используется в практике' 
            });
        }

        const result = await db.query(
            'DELETE FROM practice_location WHERE location_id = $1 RETURNING location_id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Локация не найдена' });
        }

        res.json({ 
            success: true, 
            message: 'Локация успешно удалена'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ===== CRUD ДЛЯ STUDENT_GROUPS =====
exports.getGroups = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM student_groups ORDER BY group_id');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createGroup = async (req, res) => {
    try {
        const { group_name } = req.body;
        
        if (!group_name || group_name.trim().length === 0) {
            return res.status(400).json({ error: 'Название группы обязательно' });
        }

        const result = await db.query(
            'INSERT INTO student_groups (group_name) VALUES ($1) RETURNING *',
            [group_name.trim()]
        );

        res.json({ 
            success: true, 
            message: 'Группа успешно создана',
            group: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { group_name } = req.body;
        
        if (!group_name || group_name.trim().length === 0) {
            return res.status(400).json({ error: 'Название группы обязательно' });
        }

        const result = await db.query(
            'UPDATE student_groups SET group_name = $1 WHERE group_id = $2 RETURNING *',
            [group_name.trim(), id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Группа не найдена' });
        }

        res.json({ 
            success: true, 
            message: 'Группа успешно обновлена',
            group: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;

        // Проверяем, используется ли группа в таблице student
        const checkResult = await db.query(
            'SELECT student_id FROM student WHERE group_id = $1',
            [id]
        );

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ 
                error: 'Невозможно удалить группу, так как в ней есть студенты' 
            });
        }

        const result = await db.query(
            'DELETE FROM student_groups WHERE group_id = $1 RETURNING group_id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Группа не найдена' });
        }

        res.json({ 
            success: true, 
            message: 'Группа успешно удалена'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ===== CRUD ДЛЯ ROLES =====
exports.getRoles = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM roles ORDER BY role_id');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createRole = async (req, res) => {
    try {
        const { role_name } = req.body;
        
        if (!role_name || role_name.trim().length === 0) {
            return res.status(400).json({ error: 'Название роли обязательно' });
        }

        const result = await db.query(
            'INSERT INTO roles (role_name) VALUES ($1) RETURNING *',
            [role_name.trim()]
        );

        res.json({ 
            success: true, 
            message: 'Роль успешно создана',
            role: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role_name } = req.body;
        
        if (!role_name || role_name.trim().length === 0) {
            return res.status(400).json({ error: 'Название роли обязательно' });
        }

        const result = await db.query(
            'UPDATE roles SET role_name = $1 WHERE role_id = $2 RETURNING *',
            [role_name.trim(), id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Роль не найдена' });
        }

        res.json({ 
            success: true, 
            message: 'Роль успешно обновлена',
            role: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteRole = async (req, res) => {
    try {
        const { id } = req.params;

        // Проверяем, используется ли роль в таблице supervisor
        const checkResult = await db.query(
            'SELECT supervisor_id FROM supervisor WHERE role_id = $1',
            [id]
        );

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ 
                error: 'Невозможно удалить роль, так как она используется у руководителей' 
            });
        }

        const result = await db.query(
            'DELETE FROM roles WHERE role_id = $1 RETURNING role_id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Роль не найдена' });
        }

        res.json({ 
            success: true, 
            message: 'Роль успешно удалена'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ===== CRUD ДЛЯ USER_POSITION =====
exports.getPositions = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT up.*, po.organization_name 
            FROM user_position up
            JOIN practice_organization po ON up.organization_id = po.organization_id
            ORDER BY up.position_id
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createPosition = async (req, res) => {
    try {
        const { position_name, organization_id } = req.body;
        
        if (!position_name || position_name.trim().length === 0) {
            return res.status(400).json({ error: 'Название должности обязательно' });
        }

        if (!organization_id) {
            return res.status(400).json({ error: 'ID организации обязательно' });
        }

        // Проверяем существование организации
        const orgCheck = await db.query(
            'SELECT organization_id FROM practice_organization WHERE organization_id = $1',
            [organization_id]
        );

        if (orgCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Организация не найдена' });
        }

        const result = await db.query(
            'INSERT INTO user_position (position_name, organization_id) VALUES ($1, $2) RETURNING *',
            [position_name.trim(), organization_id]
        );

        res.json({ 
            success: true, 
            message: 'Должность успешно создана',
            position: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePosition = async (req, res) => {
    try {
        const { id } = req.params;
        const { position_name, organization_id } = req.body;
        
        if (!position_name || position_name.trim().length === 0) {
            return res.status(400).json({ error: 'Название должности обязательно' });
        }

        if (!organization_id) {
            return res.status(400).json({ error: 'ID организации обязательно' });
        }

        // Проверяем существование организации
        const orgCheck = await db.query(
            'SELECT organization_id FROM practice_organization WHERE organization_id = $1',
            [organization_id]
        );

        if (orgCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Организация не найдена' });
        }

        const result = await db.query(
            'UPDATE user_position SET position_name = $1, organization_id = $2 WHERE position_id = $3 RETURNING *',
            [position_name.trim(), organization_id, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Должность не найдена' });
        }

        res.json({ 
            success: true, 
            message: 'Должность успешно обновлена',
            position: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deletePosition = async (req, res) => {
    try {
        const { id } = req.params;

        // Проверяем, используется ли должность в таблице supervisor
        const checkResult = await db.query(
            'SELECT supervisor_id FROM supervisor WHERE position_id = $1',
            [id]
        );

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ 
                error: 'Невозможно удалить должность, так как она используется у руководителей' 
            });
        }

        const result = await db.query(
            'DELETE FROM user_position WHERE position_id = $1 RETURNING position_id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Должность не найдена' });
        }

        res.json({ 
            success: true, 
            message: 'Должность успешно удалена'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ===== CRUD ДЛЯ SUPERVISOR =====
exports.getSupervisors = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                s.*,
                p.practice_id,
                p.start_date as practice_start,
                p.end_date as practice_end,
                r.role_name,
                up.position_name,
                po.organization_name
            FROM supervisor s
            JOIN practice p ON s.practice_id = p.practice_id
            JOIN roles r ON s.role_id = r.role_id
            JOIN user_position up ON s.position_id = up.position_id
            JOIN practice_organization po ON up.organization_id = po.organization_id
            ORDER BY s.supervisor_id
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createSupervisor = async (req, res) => {
    try {
        const { practice_id, position_id, role_id, full_name } = req.body;
        
        if (!full_name || full_name.trim().length === 0) {
            return res.status(400).json({ error: 'ФИО руководителя обязательно' });
        }

        if (!practice_id) {
            return res.status(400).json({ error: 'ID практики обязательно' });
        }

        if (!position_id) {
            return res.status(400).json({ error: 'ID должности обязательно' });
        }

        if (!role_id) {
            return res.status(400).json({ error: 'ID роли обязательно' });
        }

        // Проверяем существование практики
        const practiceCheck = await db.query(
            'SELECT practice_id FROM practice WHERE practice_id = $1',
            [practice_id]
        );

        if (practiceCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Практика не найдена' });
        }

        // Проверяем существование должности
        const positionCheck = await db.query(
            'SELECT position_id FROM user_position WHERE position_id = $1',
            [position_id]
        );

        if (positionCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Должность не найдена' });
        }

        // Проверяем существование роли
        const roleCheck = await db.query(
            'SELECT role_id FROM roles WHERE role_id = $1',
            [role_id]
        );

        if (roleCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Роль не найдена' });
        }

        const result = await db.query(
            'INSERT INTO supervisor (practice_id, position_id, role_id, full_name) VALUES ($1, $2, $3, $4) RETURNING *',
            [practice_id, position_id, role_id, full_name.trim()]
        );

        res.json({ 
            success: true, 
            message: 'Руководитель успешно создан',
            supervisor: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateSupervisor = async (req, res) => {
    try {
        const { id } = req.params;
        const { practice_id, position_id, role_id, full_name } = req.body;
        
        if (!full_name || full_name.trim().length === 0) {
            return res.status(400).json({ error: 'ФИО руководителя обязательно' });
        }

        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (practice_id !== undefined) {
            updates.push(`practice_id = $${paramIndex}`);
            values.push(practice_id);
            paramIndex++;
        }

        if (position_id !== undefined) {
            updates.push(`position_id = $${paramIndex}`);
            values.push(position_id);
            paramIndex++;
        }

        if (role_id !== undefined) {
            updates.push(`role_id = $${paramIndex}`);
            values.push(role_id);
            paramIndex++;
        }

        updates.push(`full_name = $${paramIndex}`);
        values.push(full_name.trim());
        paramIndex++;

        values.push(id);

        const query = `
            UPDATE supervisor 
            SET ${updates.join(', ')}
            WHERE supervisor_id = $${paramIndex}
            RETURNING *
        `;

        const result = await db.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Руководитель не найдена' });
        }

        res.json({ 
            success: true, 
            message: 'Руководитель успешно обновлена',
            supervisor: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteSupervisor = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            'DELETE FROM supervisor WHERE supervisor_id = $1 RETURNING supervisor_id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Руководитель не найден' });
        }

        res.json({ 
            success: true, 
            message: 'Руководитель успешно удален'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ =====
exports.getOrganizations = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM practice_organization ORDER BY organization_id');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPractices = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM practice ORDER BY practice_id');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = exports;