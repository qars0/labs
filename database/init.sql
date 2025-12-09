-- Practice_Organization таблица
CREATE TABLE IF NOT EXISTS practice_organization (
    organization_id SERIAL PRIMARY KEY,
    organization_name VARCHAR(255) NOT NULL
);

-- Practice_location таблица
CREATE TABLE IF NOT EXISTS practice_location (
    location_id SERIAL PRIMARY KEY,
    location VARCHAR(500) NOT NULL
);

-- Roles таблица
CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL
);

-- Student_groups таблица
CREATE TABLE IF NOT EXISTS student_groups (
    group_id SERIAL PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL
);

-- Users таблица
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    full_name VARCHAR(255) NOT NULL
);

-- AdminUsers таблица
CREATE TABLE IF NOT EXISTS admin_users (
    admin_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    CONSTRAINT admin_users_user_fk FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Practice таблица
CREATE TABLE IF NOT EXISTS practice (
    practice_id SERIAL PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location_id INTEGER NOT NULL,
    CONSTRAINT practice_practice_location_fk FOREIGN KEY (location_id) REFERENCES practice_location(location_id) ON DELETE CASCADE
);

-- Schedule таблица
CREATE TABLE IF NOT EXISTS schedule (
    schedule_id SERIAL PRIMARY KEY,
    practice_id INTEGER NOT NULL,
    work_number INTEGER NOT NULL,
    work_description TEXT NOT NULL,
    plan_start_date DATE NOT NULL,
    plan_end_work DATE NOT NULL,
    CONSTRAINT schedule_practice_fk FOREIGN KEY (practice_id) REFERENCES practice(practice_id) ON DELETE CASCADE
);

-- Student таблица
CREATE TABLE IF NOT EXISTS student (
    student_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    practice_id INTEGER NOT NULL,
    CONSTRAINT student_user_fk FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT student_user_groups_fk FOREIGN KEY (group_id) REFERENCES student_groups(group_id) ON DELETE CASCADE,
    CONSTRAINT student_practice_fk FOREIGN KEY (practice_id) REFERENCES practice(practice_id) ON DELETE CASCADE
);

-- User_position таблица
CREATE TABLE IF NOT EXISTS user_position (
    position_id SERIAL PRIMARY KEY,
    position_name VARCHAR(100) NOT NULL,
    organization_id INTEGER NOT NULL,
    CONSTRAINT user_position_practice_organization_fk FOREIGN KEY (organization_id) REFERENCES practice_organization(organization_id) ON DELETE CASCADE
);

-- Work_diary таблица
CREATE TABLE IF NOT EXISTS work_diary (
    entry_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    work_date DATE NOT NULL,
    description TEXT NOT NULL,
    CONSTRAINT work_diary_student_fk FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE
);

-- Individual_work таблица
CREATE TABLE IF NOT EXISTS individual_work (
    individual_work_id SERIAL PRIMARY KEY,
    issue_date DATE NOT NULL,
    work_description TEXT NOT NULL,
    issue_deadline DATE NOT NULL,
    complete_mark BOOLEAN NOT NULL DEFAULT FALSE,
    student_id INTEGER NOT NULL,
    CONSTRAINT individual_work_student_fk FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE
);

-- Supervisor таблица
CREATE TABLE IF NOT EXISTS supervisor (
    supervisor_id SERIAL PRIMARY KEY,
    practice_id INTEGER NOT NULL,
    position_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    CONSTRAINT supervisor_practice_fk FOREIGN KEY (practice_id) REFERENCES practice(practice_id) ON DELETE CASCADE,
    CONSTRAINT supervisor_user_position_fk FOREIGN KEY (position_id) REFERENCES user_position(position_id) ON DELETE CASCADE,
    CONSTRAINT supervisor_roles_fk FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- Создание индексов для улучшения производительности
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_location_id ON practice(location_id);
CREATE INDEX IF NOT EXISTS idx_schedule_practice_id ON schedule(practice_id);
CREATE INDEX IF NOT EXISTS idx_student_user_id ON student(user_id);
CREATE INDEX IF NOT EXISTS idx_student_group_id ON student(group_id);
CREATE INDEX IF NOT EXISTS idx_student_practice_id ON student(practice_id);
CREATE INDEX IF NOT EXISTS idx_user_position_organization_id ON user_position(organization_id);
CREATE INDEX IF NOT EXISTS idx_work_diary_student_id ON work_diary(student_id);
CREATE INDEX IF NOT EXISTS idx_individual_work_student_id ON individual_work(student_id);
CREATE INDEX IF NOT EXISTS idx_supervisor_practice_id ON supervisor(practice_id);
CREATE INDEX IF NOT EXISTS idx_supervisor_position_id ON supervisor(position_id);
CREATE INDEX IF NOT EXISTS idx_supervisor_role_id ON supervisor(role_id);

-- Вставка тестовых данных
INSERT INTO practice_organization (organization_name) 
VALUES 
    ('ОмГТУ'),
    ('IT компания "Прогресс"'),
    ('Научно-исследовательский институт')
ON CONFLICT (organization_id) DO NOTHING;

INSERT INTO practice_location (location) 
VALUES 
    ('ОмГТУ, Главный корпус, ауд. 310'),
    ('Лаборатория №5'),
    ('Удаленная практика')
ON CONFLICT (location_id) DO NOTHING;

INSERT INTO roles (role_name) 
VALUES 
    ('Руководитель практики'),
    ('Руководитель от организации')
ON CONFLICT (role_id) DO NOTHING;

INSERT INTO student_groups (group_name) 
VALUES 
    ('БИТ-241'),
    ('БИТ-242'),
    ('КЗИ-241')
ON CONFLICT (group_id) DO NOTHING;

INSERT INTO users (username, password, full_name) 
VALUES 
    ('admin', 'admin', 'Администратор Системы'),
    ('student1', '123', 'Иванов Иван Иванович'),
    ('student2', '123', 'Петров Петр Петрович')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO admin_users (user_id) 
SELECT user_id FROM users WHERE username = 'admin'
ON CONFLICT (admin_id) DO NOTHING;

INSERT INTO practice (start_date, end_date, location_id) 
VALUES 
    ('2025-09-01', '2025-10-30', 1),
    ('2025-10-01', '2025-11-30', 2)
ON CONFLICT (practice_id) DO NOTHING;

-- Создание пользователя для приложения
--DO $$
--BEGIN
--    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_user') THEN
--        CREATE USER app_user WITH PASSWORD 'app_password';
--    END IF;
--END
--$$;
--
-- Даем права пользователю приложения
--GRANT CONNECT ON DATABASE mydatabase TO app_user;
--GRANT USAGE ON SCHEMA public TO app_user;
--GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
--GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;

COMMENT ON TABLE users IS 'Таблица пользователей системы';
COMMENT ON TABLE student IS 'Таблица студентов';
COMMENT ON TABLE practice IS 'Таблица практик';
COMMENT ON TABLE work_diary IS 'Дневник практики студентов';
COMMENT ON COLUMN users.password IS 'Пароль';

-- === ТРИГГЕРЫ ===

-- 1. Триггер для автоматической установки даты создания записи в дневнике
CREATE OR REPLACE FUNCTION set_diary_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.work_date IS NULL THEN
        NEW.work_date = CURRENT_DATE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER diary_date_trigger
BEFORE INSERT ON work_diary
FOR EACH ROW
EXECUTE FUNCTION set_diary_date();

-- 2. Триггер для проверки дат практики
CREATE OR REPLACE FUNCTION check_practice_dates()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.start_date > NEW.end_date THEN
        RAISE EXCEPTION 'Дата начала практики не может быть позже даты окончания';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER practice_dates_trigger
BEFORE INSERT OR UPDATE ON practice
FOR EACH ROW
EXECUTE FUNCTION check_practice_dates();

-- === ФУНКЦИИ ===

-- 1. Функция: количество студентов на практике
CREATE OR REPLACE FUNCTION get_students_count(practice_id_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
    student_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO student_count
    FROM student
    WHERE practice_id = practice_id_param;
    
    RETURN student_count;
END;
$$ LANGUAGE plpgsql;

-- 2. Функция: среднее количество записей в дневнике на студента
CREATE OR REPLACE FUNCTION get_avg_diary_entries()
RETURNS DECIMAL AS $$
DECLARE
    avg_entries DECIMAL;
BEGIN
    SELECT AVG(entry_count) INTO avg_entries
    FROM (
        SELECT student_id, COUNT(*) as entry_count
        FROM work_diary
        GROUP BY student_id
    ) AS diary_counts;
    
    RETURN COALESCE(avg_entries, 0);
END;
$$ LANGUAGE plpgsql;

-- === ПРОЦЕДУРЫ ===

-- 1. Процедура: добавить студента
CREATE OR REPLACE PROCEDURE add_student(
    p_username VARCHAR(100),
    p_password VARCHAR(100),
    p_full_name VARCHAR(255),
    p_group_id INTEGER,
    p_practice_id INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_id INTEGER;
BEGIN
    -- Вставляем пользователя
    INSERT INTO users (username, password, full_name)
    VALUES (p_username, p_password, p_full_name)
    RETURNING user_id INTO v_user_id;
    
    -- Вставляем студента
    INSERT INTO student (user_id, group_id, practice_id)
    VALUES (v_user_id, p_group_id, p_practice_id);
    
    COMMIT;
END;
$$;

-- 2. Процедура: закрыть практику
CREATE OR REPLACE PROCEDURE close_practice(
    p_practice_id INTEGER,
    p_end_date DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE practice 
    SET end_date = p_end_date 
    WHERE practice_id = p_practice_id;
    
    -- Можно добавить дополнительную логику, например, уведомления
    
    COMMIT;
END;
$$;

-- === ТРАНЗАКЦИИ (примеры в коде контроллера) ===

-- === ТЕСТОВЫЕ ДАННЫЕ ДЛЯ ПРОВЕРКИ ===

-- Добавляем тестовые данные для работы запросов

-- Добавляем больше пользователей
INSERT INTO users (username, password, full_name) VALUES
    ('student3', '123', 'Сидоров Сидор Сидорович'),
    ('teacher1', '123', 'Преподаватель Иван Иванович'),
    ('org_supervisor', '123', 'Руководитель от организации Петров П.П.')
ON CONFLICT (user_id) DO NOTHING;

-- Добавляем позиции
INSERT INTO user_position (position_name, organization_id) VALUES
    ('Старший преподаватель', 1),
    ('Инженер', 2),
    ('Научный сотрудник', 3)
ON CONFLICT (position_id) DO NOTHING;

-- Добавляем руководителей
INSERT INTO supervisor (practice_id, position_id, role_id, full_name) VALUES
    (1, 1, 1, 'Иванов Иван Иванович'),
    (2, 2, 2, 'Петров Петр Петрович')
ON CONFLICT (supervisor_id) DO NOTHING;

-- Добавляем студентов
INSERT INTO student (user_id, group_id, practice_id) 
SELECT user_id, 1, 1 FROM users WHERE username = 'student1'
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO student (user_id, group_id, practice_id) 
SELECT user_id, 2, 2 FROM users WHERE username = 'student2'
ON CONFLICT (student_id) DO NOTHING;

-- Добавляем записи в дневник
INSERT INTO work_diary (student_id, work_date, description) VALUES
    (1, '2025-09-01', 'Знакомство с коллективом и рабочим местом'),
    (1, '2025-09-02', 'Изучение технической документации'),
    (2, '2025-10-01', 'Настройка рабочего окружения'),
    (2, '2025-10-02', 'Работа над первым заданием')
ON CONFLICT (entry_id) DO NOTHING;

-- Добавляем индивидуальные задания
INSERT INTO individual_work (issue_date, work_description, issue_deadline, complete_mark, student_id) VALUES
    ('2025-09-01', 'Разработать план практики', '2025-09-05', TRUE, 1),
    ('2025-10-01', 'Изучить основы SQL', '2025-10-10', FALSE, 2)
ON CONFLICT (individual_work_id) DO NOTHING;

-- Расписание
INSERT INTO schedule (practice_id, work_number, work_description, plan_start_date, plan_end_work) VALUES
    (1, 1, 'Введение в практику', '2025-09-01', '2025-09-05'),
    (1, 2, 'Основная работа', '2025-09-06', '2025-09-20'),
    (2, 1, 'Ознакомительный этап', '2025-10-01', '2025-10-07')
ON CONFLICT (schedule_id) DO NOTHING;