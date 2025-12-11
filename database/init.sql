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
    description TEXT NOT NULL
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

-- === ОБНОВЛЕНИЕ ТАБЛИЦ ===

-- Добавляем created_at в work_diary
ALTER TABLE work_diary ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Добавляем created_at в individual_work
ALTER TABLE individual_work ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Добавляем новые столбцы для отслеживания изменений
ALTER TABLE work_diary ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;
ALTER TABLE work_diary ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

ALTER TABLE individual_work ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;
ALTER TABLE individual_work ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Вставка тестовых данных
-- Вставка тестовых данных (полный набор)

-- 1. Организации для практик
INSERT INTO practice_organization (organization_name) 
VALUES 
    ('ОмГТУ'),
    ('IT компания "Прогресс"'),
    ('Научно-исследовательский институт'),
    ('ПАО "Сбербанк"'),
    ('ООО "Технологии будущего"'),
    ('Яндекс'),
    ('VK'),
    ('Газпром нефть'),
    ('Ростелеком'),
    ('Тинькофф Банк'),
    ('Лаборатория Касперского'),
    ('Сколково')
ON CONFLICT (organization_id) DO NOTHING;

-- 2. Локации практик
INSERT INTO practice_location (location) 
VALUES 
    ('ОмГТУ, Главный корпус, ауд. 310'),
    ('Лаборатория №5'),
    ('Удаленная практика'),
    ('ОмГТУ, Корпус ИВТ, ауд. 105'),
    ('Офис IT компании "Прогресс", ул. Ленина, 10'),
    ('Коворкинг "Технопарк"'),
    ('Лаборатория искусственного интеллекта'),
    ('Дата-центр ОмГТУ'),
    ('ОмГТУ, Библиотека, читальный зал №3'),
    ('Корпоративный университет Сбербанка'),
    ('Офис VK, Москва, Ленинградский проспект'),
    ('Лаборатория кибербезопасности')
ON CONFLICT (location_id) DO NOTHING;

-- 3. Роли в системе
INSERT INTO roles (role_name) 
VALUES 
    ('Руководитель практики'),
    ('Руководитель от организации'),
    ('Технический руководитель'),
    ('Ментор'),
    ('Консультант'),
    ('Эксперт'),
    ('Ревьюер'),
    ('Координатор')
ON CONFLICT (role_id) DO NOTHING;

-- 4. Группы студентов
INSERT INTO student_groups (group_name) 
VALUES 
    ('БИТ-241'),
    ('БИТ-242'),
    ('КЗИ-241'),
    ('БИТ-231'),
    ('КЗИ-231'),
    ('ПМИ-241'),
    ('ИВТ-241'),
    ('БИТ-221'),
    ('КЗИ-221'),
    ('ПМИ-231'),
    ('АДБ-241'),
    ('ИСП-241')
ON CONFLICT (group_id) DO NOTHING;

-- 5. Пользователи системы
INSERT INTO users (username, password, full_name) 
VALUES 
    ('admin', 'admin', 'Администратор Системы'),
    ('student1', '123', 'Иванов Иван Иванович'),
    ('student2', '123', 'Петров Петр Петрович'),
    ('student3', '123', 'Сидорова Анна Сергеевна'),
    ('student4', '123', 'Козлов Дмитрий Владимирович'),
    ('student5', '123', 'Морозова Екатерина Александровна'),
    ('student6', '123', 'Волков Артем Сергеевич'),
    ('student7', '123', 'Новикова Ольга Дмитриевна'),
    ('student8', '123', 'Федоров Максим Александрович')
ON CONFLICT (user_id) DO NOTHING;

-- 6. Администраторы
INSERT INTO admin_users (user_id) 
SELECT user_id FROM users WHERE username IN ('admin')
ON CONFLICT (admin_id) DO NOTHING;

-- 7. Практики
INSERT INTO practice (start_date, end_date, location_id) 
VALUES 
    ('2025-09-01', '2025-10-30', 1),
    ('2025-10-01', '2025-11-30', 2),
    ('2025-09-15', '2025-12-15', 3),
    ('2025-08-20', '2025-10-20', 4),
    ('2025-11-01', '2026-01-31', 5),
    ('2025-07-01', '2025-08-31', 6),
    ('2025-12-01', '2026-02-28', 7),
    ('2026-01-15', '2026-03-15', 8),
    ('2025-06-01', '2025-07-31', 9),
    ('2025-10-15', '2025-12-15', 10)
ON CONFLICT (practice_id) DO NOTHING;

-- 8. Расписание практик
INSERT INTO schedule (practice_id, work_number, work_description, plan_start_date, plan_end_work) 
VALUES 
    (1, 1, 'Ознакомление с предприятием и техникой безопасности', '2025-09-01', '2025-09-03'),
    (1, 2, 'Изучение технологического процесса', '2025-09-04', '2025-09-10'),
    (1, 3, 'Выполнение практических заданий', '2025-09-11', '2025-10-20'),
    (1, 4, 'Подготовка и защита отчета', '2025-10-21', '2025-10-30'),
    (2, 1, 'Введение в разработку ПО', '2025-10-01', '2025-10-05'),
    (2, 2, 'Работа над проектом', '2025-10-06', '2025-11-20'),
    (2, 3, 'Тестирование и отладка', '2025-11-21', '2025-11-28'),
    (2, 4, 'Финальная презентация', '2025-11-29', '2025-11-30'),
    (3, 1, 'Онлайн-обучение и инструктаж', '2025-09-15', '2025-09-20'),
    (3, 2, 'Исследовательская работа', '2025-09-21', '2025-11-30'),
    (4, 1, 'Базовая подготовка', '2025-08-20', '2025-08-25'),
    (5, 1, 'Корпоративное обучение', '2025-11-01', '2025-11-07')
ON CONFLICT (schedule_id) DO NOTHING;

-- 9. Студенты
INSERT INTO student (user_id, group_id, practice_id) 
VALUES 
    (2, 1, 1),   -- Иванов Иван
    (3, 1, 1),   -- Петров Петр
    (4, 2, 2),   -- Сидорова Анна
    (5, 3, 3),   -- Козлов Дмитрий
    (6, 1, 4),   -- Морозова Екатерина
    (7, 4, 5),   -- Волков Артем
    (8, 5, 6),   -- Новикова Ольга
    (9, 6, 7),   -- Федоров Максим
    (2, 1, 2),   -- Иванов Иван (вторая практика)
    (3, 1, 3),   -- Петров Петр (вторая практика)
    (4, 2, 4),   -- Сидорова Анна (вторая практика)
    (5, 3, 5)    -- Козлов Дмитрий (вторая практика)
ON CONFLICT (student_id) DO NOTHING;

-- 10. Должности
INSERT INTO user_position (position_name, organization_id) 
VALUES 
    ('Старший разработчик', 2),
    ('Инженер-исследователь', 3),
    ('Системный администратор', 1),
    ('Аналитик данных', 4),
    ('Проектный менеджер', 5),
    ('Тестировщик ПО', 2),
    ('Научный сотрудник', 3),
    ('DevOps инженер', 6),
    ('Data Scientist', 7),
    ('Архитектор баз данных', 8),
    ('Специалист по кибербезопасности', 9),
    ('Frontend разработчик', 10),
    ('Backend разработчик', 11),
    ('Технический директор', 12),
    ('Руководитель отдела разработки', 2)
ON CONFLICT (position_id) DO NOTHING;


-- 11. РАБОЧИЕ ДНЕВНИКИ - расширенные данные
INSERT INTO work_diary (student_id, work_date, description) 
VALUES 
    -- Студент 1 (Иванов Иван) - Практика 1 (сентябрь-октябрь)
    (1, '2025-09-01', 'Знакомство с компанией. Инструктаж по технике безопасности. Получение доступа к корпоративным системам.'),
    (1, '2025-09-02', 'Изучение внутренней документации. Знакомство с командой разработки. Настройка рабочего места.'),
    (1, '2025-09-03', 'Обзор архитектуры проекта. Установка необходимого ПО: IDE, Git, Docker, PostgreSQL.'),
    (1, '2025-09-04', 'Изучение бизнес-логики приложения. Анализ существующего кода. Участие в daily-митинге.'),
    (1, '2025-09-05', 'Работа с Git: клонирование репозитория, создание ветки, первые коммиты.'),
    (1, '2025-09-08', 'Разработка ER-диаграммы базы данных для нового модуля. Согласование с архитектором.'),
    (1, '2025-09-09', 'Создание миграций БД. Написание SQL-скриптов для инициализации таблиц.'),
    (1, '2025-09-10', 'Реализация базовых CRUD операций для сущности "Пользователь" на Java Spring Boot.'),
    (1, '2025-09-11', 'Написание unit-тестов для сервиса аутентификации. Использование JUnit и Mockito.'),
    (1, '2025-09-12', 'Оптимизация SQL-запросов. Создание индексов для часто используемых полей.'),
    (1, '2025-09-15', 'Интеграция с внешним API платежной системы. Обработка webhook-ов.'),
    (1, '2025-09-16', 'Рефакторинг кода согласно code review. Исправление замечаний от тимлида.'),
    (1, '2025-09-17', 'Разработка модуля экспорта данных в Excel. Использование Apache POI.'),
    (1, '2025-09-18', 'Настройка логирования с помощью SLF4J и Logback. Конфигурация уровней логирования.'),
    (1, '2025-09-19', 'Создание Swagger документации для REST API. Описание всех endpoint-ов.'),
    (1, '2025-09-22', 'Участие в планировании спринта. Оценка задач по системе story points.'),
    (1, '2025-09-23', 'Разработка функционала загрузки файлов. Валидация форматов и размеров.'),
    (1, '2025-09-24', 'Реализация пагинации и сортировки для табличных данных.'),
    (1, '2025-09-25', 'Оптимизация производительности: анализ медленных запросов с помощью EXPLAIN.'),
    (1, '2025-09-26', 'Написание интеграционных тестов с использованием Testcontainers.'),
    (1, '2025-09-29', 'Подготовка демонстрации функционала для заказчика. Создание презентации.'),
    (1, '2025-09-30', 'Финальный code review. Мерж кода в основную ветку. Подведение итогов месяца.'),
    
    -- Студент 2 (Петров Петр) - Практика 1 (сентябрь-октябрь)
    (2, '2025-09-01', 'Ознакомительный день. Экскурсия по офису. Знакомство с корпоративной культурой.'),
    (2, '2025-09-02', 'Изучение фронтенд стека: React, TypeScript, Redux, Material-UI.'),
    (2, '2025-09-03', 'Настройка окружения разработки. Установка Node.js, npm, Webpack.'),
    (2, '2025-09-04', 'Изучение дизайн-системы компании. Работа с Figma макетами.'),
    (2, '2025-09-05', 'Создание компонента навигационного меню. Адаптивная верстка.'),
    (2, '2025-09-08', 'Разработка формы авторизации с валидацией. Использование Formik и Yup.'),
    (2, '2025-09-09', 'Интеграция с бэкенд API. Настройка axios interceptors для обработки ошибок.'),
    (2, '2025-09-10', 'Создание dashboard с графиками. Использование Chart.js для визуализации данных.'),
    (2, '2025-09-11', 'Реализация drag-and-drop интерфейса для управления задачами.'),
    (2, '2025-09-12', 'Оптимизация производительности React приложения: memo, useCallback, lazy loading.'),
    (2, '2025-09-15', 'Написание unit-тестов с Jest и React Testing Library.'),
    (2, '2025-09-16', 'Настройка CI/CD пайплайна в GitLab. Автоматизация сборки и деплоя.'),
    (2, '2025-09-17', 'Реализация темной/светлой темы. Создание переключателя.'),
    (2, '2025-09-18', 'Интернационализация приложения (i18n). Поддержка русского и английского языков.'),
    (2, '2025-09-19', 'Разработка PWA функционала: offline mode, push notifications.'),
    (2, '2025-09-22', 'Code splitting и динамический импорт модулей для уменьшения бандла.'),
    (2, '2025-09-23', 'Создание кастомных хуков для работы с локальным хранилищем.'),
    (2, '2025-09-24', 'Интеграция с WebSocket для real-time обновлений данных.'),
    (2, '2025-09-25', 'Оптимизация загрузки изображений: lazy loading, WebP формат.'),
    (2, '2025-09-26', 'Настройка мониторинга ошибок с Sentry.'),
    (2, '2025-09-29', 'Подготовка к демо. Тестирование на разных устройствах и браузерах.'),
    (2, '2025-09-30', 'Финальный рефакторинг. Написание документации для компонентов.'),
    
    -- Студент 3 (Сидорова Анна) - Практика 2 (октябрь-ноябрь)
    (3, '2025-10-01', 'Вводный день в отделе аналитики. Знакомство с инструментами: Python, Pandas, Jupyter.'),
    (3, '2025-10-02', 'Изучение источников данных компании. Работа с Data Warehouse.'),
    (3, '2025-10-03', 'Очистка и предобработка данных. Работа с пропущенными значениями и выбросами.'),
    (3, '2025-10-04', 'Анализ пользовательского поведения. Построение воронки продаж.'),
    (3, '2025-10-07', 'Разработка ETL пайплайна для ежедневных отчетов.'),
    (3, '2025-10-08', 'Создание дашборда в Tableau для мониторинга KPI.'),
    (3, '2025-10-09', 'Проведение A/B тестирования новой функциональности. Статистический анализ результатов.'),
    (3, '2025-10-10', 'Построение прогнозной модели оттока клиентов с использованием Random Forest.'),
    (3, '2025-10-11', 'Оптимизация гиперпараметров модели с помощью GridSearchCV.'),
    (3, '2025-10-14', 'Визуализация результатов анализа с помощью matplotlib и seaborn.'),
    (3, '2025-10-15', 'Подготовка аналитического отчета с рекомендациями для бизнеса.'),
    (3, '2025-10-16', 'Презентация результатов руководству. Обсуждение insights.'),
    
    -- Студент 4 (Козлов Дмитрий) - Практика 3 (сентябрь-декабрь)
    (4, '2025-09-15', 'Начало исследовательской практики. Постановка целей и задач.'),
    (4, '2025-09-16', 'Обзор литературы по теме "Машинное обучение в компьютерном зрении".'),
    (4, '2025-09-17', 'Изучение библиотек: OpenCV, TensorFlow, PyTorch.'),
    (4, '2025-09-18', 'Подготовка датасета для обучения модели. Аугментация данных.'),
    (4, '2025-09-19', 'Разработка нейросетевой архитектуры для классификации изображений.'),
    (4, '2025-09-22', 'Обучение модели. Мониторинг метрик accuracy, precision, recall.'),
    (4, '2025-09-23', 'Оптимизация модели: dropout, batch normalization, early stopping.'),
    (4, '2025-09-24', 'Тестирование модели на валидационной выборке. Анализ ошибок.'),
    (4, '2025-09-25', 'Внедрение модели в веб-приложение с использованием Flask.'),
    (4, '2025-09-26', 'Написание научной статьи по результатам исследования.'),
    (4, '2025-09-29', 'Подготовка к защите практики. Создание презентации.'),
    
    -- Студент 5 (Морозова Екатерина) - Практика 4 (август-октябрь)
    (5, '2025-08-20', 'Знакомство с командой DevOps. Изучение инфраструктуры компании.'),
    (5, '2025-08-21', 'Работа с облачной платформой Yandex Cloud. Создание виртуальных машин.'),
    (5, '2025-08-22', 'Настройка Kubernetes кластера. Развертывание миникуба.'),
    (5, '2025-08-25', 'Создание Docker образов для микросервисов. Оптимизация Dockerfile.'),
    (5, '2025-08-26', 'Написание Helm charts для деплоя приложений в k8s.'),
    (5, '2025-08-27', 'Настройка мониторинга с Prometheus и Grafana.'),
    (5, '2025-08-28', 'Конфигурация алертинга. Создание дашбордов для отслеживания метрик.'),
    (5, '2025-08-29', 'Автоматизация развертывания с GitLab CI/CD.'),
    (5, '2025-09-01', 'Настройка centralized logging с ELK стеком.'),
    (5, '2025-09-02', 'Реализация blue-green деплоя для бесшовного обновления.'),
    (5, '2025-09-03', 'Создание disaster recovery плана. Настройка бэкапов.'),
    
    -- Студент 6 (Волков Артем) - Практика 5 (ноябрь-январь)
    (6, '2025-11-01', 'Организационный день в банковском секторе. Требования безопасности.'),
    (6, '2025-11-02', 'Изучение финтех продуктов. Анализ конкурентной среды.'),
    (6, '2025-11-03', 'Работа с финансовыми данными. Нормативно-правовая база.'),
    (6, '2025-11-04', 'Разработка кредитного скоринга модели. Особенности банковских данных.'),
    (6, '2025-11-05', 'Валидация модели. Соответствие требованиям ЦБ РФ.'),
    
    -- Студент 7 (Новикова Ольга) - Практика 6 (июль-август)
    (7, '2025-07-01', 'Летняя практика в стартапе. Знакомство с agile методологией.'),
    (7, '2025-07-02', 'Участие в хакатоне по разработке MVP продукта.'),
    (7, '2025-07-03', 'Прототипирование в Figma. User research и customer development.'),
    (7, '2025-07-04', 'Разработка бизнес-плана. Расчет unit-экономики.'),
    (7, '2025-07-05', 'Питч проекта перед инвесторами. Получение обратной связи.'),
    
    -- Студент 8 (Федоров Максим) - Практика 7 (декабрь-февраль)
    (8, '2025-12-01', 'Начало практики в области AI. Изучение state-of-the-art моделей.'),
    (8, '2025-12-02', 'Работа с трансформерами. Fine-tuning BERT для NLP задач.'),
    (8, '2025-12-03', 'Генерация текста с помощью GPT-моделей. Prompt engineering.'),
    (8, '2025-12-04', 'Эксперименты с few-shot learning.'),
    (8, '2025-12-05', 'Подготовка research paper с результатами экспериментов.')
ON CONFLICT (entry_id) DO NOTHING;

-- 12. ИНДИВИДУАЛЬНЫЕ ЗАДАНИЯ - расширенные данные
INSERT INTO individual_work (issue_date, work_description, issue_deadline, complete_mark, student_id) 
VALUES 
    -- Студент 1 - 5 заданий (3 выполнены, 2 в процессе)
    ('2025-09-05', 'Разработать полную ER-диаграмму базы данных для системы управления практиками. Включить все сущности, связи, атрибуты.', '2025-09-12', TRUE, 1),
    ('2025-09-10', 'Реализовать модуль аутентификации и авторизации с JWT токенами. Поддержка ролей: студент, руководитель, администратор.', '2025-09-20', TRUE, 1),
    ('2025-09-15', 'Создать REST API для работы с рабочими дневниками: создание, чтение, обновление, удаление записей.', '2025-09-25', TRUE, 1),
    ('2025-09-20', 'Разработать систему генерации отчетов в формате PDF (еженедельный отчет по практике).', '2025-10-01', FALSE, 1),
    ('2025-09-25', 'Написать комплекс unit и integration тестов с покрытием не менее 80%.', '2025-10-05', FALSE, 1),
    
    -- Студент 2 - 4 задания (2 выполнены, 2 в процессе)
    ('2025-09-05', 'Разработать интерактивный фронтенд для системы практик на React + TypeScript. Адаптивный дизайн.', '2025-09-15', TRUE, 2),
    ('2025-09-12', 'Реализовать drag-and-drop доску задач (kanban board) для отслеживания прогресса по заданиям.', '2025-09-22', TRUE, 2),
    ('2025-09-18', 'Создать дашборд с графиками для визуализации статистики по практикам (Chart.js).', '2025-09-28', FALSE, 2),
    ('2025-09-22', 'Добавить PWA функционал: offline mode, push notifications, install prompt.', '2025-10-02', FALSE, 2),
    
    -- Студент 3 - 3 задания (все выполнены)
    ('2025-10-01', 'Провести анализ пользовательской активности за последний квартал. Выявить паттерны поведения.', '2025-10-08', TRUE, 3),
    ('2025-10-05', 'Построить прогнозную модель оттока клиентов (churn prediction) с точностью не менее 85%.', '2025-10-15', TRUE, 3),
    ('2025-10-10', 'Создать интерактивный дашборд в Tableau с ключевыми бизнес-метриками.', '2025-10-18', TRUE, 3),
    
    -- Студент 4 - 4 задания (3 выполнены, 1 в процессе)
    ('2025-09-15', 'Провести обзор state-of-the-art методов в области компьютерного зрения. Сравнительный анализ.', '2025-09-22', TRUE, 4),
    ('2025-09-18', 'Обучить нейросетевую модель для классификации изображений с точностью >90% на тестовой выборке.', '2025-09-28', TRUE, 4),
    ('2025-09-22', 'Оптимизировать модель для работы на мобильных устройствах (quantization, pruning).', '2025-10-02', TRUE, 4),
    ('2025-09-25', 'Написать научную статью по результатам исследования. Подготовить к публикации.', '2025-10-10', FALSE, 4),
    
    -- Студент 5 - 3 задания (все выполнены)
    ('2025-08-20', 'Автоматизировать процесс развертывания приложения с использованием GitLab CI/CD и Kubernetes.', '2025-08-30', TRUE, 5),
    ('2025-08-25', 'Настроить мониторинг и алертинг для продакшен окружения (Prometheus + Grafana).', '2025-09-05', TRUE, 5),
    ('2025-08-30', 'Реализовать стратегию blue-green deployment для бесшовных обновлений.', '2025-09-10', TRUE, 5),
    
    -- Студент 6 - 3 задания (1 выполнен, 2 в процессе)
    ('2025-11-01', 'Разработать модель кредитного скоринга с учетом регуляторных требований ЦБ РФ.', '2025-11-15', TRUE, 6),
    ('2025-11-05', 'Создать систему мониторинга финансовых рисков в реальном времени.', '2025-11-20', FALSE, 6),
    ('2025-11-10', 'Провести stress-testing модели на исторических данных кризисных периодов.', '2025-11-25', FALSE, 6),
    
    -- Студент 7 - 2 задания (оба выполнены)
    ('2025-07-01', 'Разработать бизнес-план и финансовую модель для стартапа. Рассчитать unit-экономику.', '2025-07-10', TRUE, 7),
    ('2025-07-05', 'Создать питч-презентацию для инвесторов (10 слайдов). Провести тренировочный питч.', '2025-07-12', TRUE, 7),
    
    -- Студент 8 - 3 задания (1 выполнен, 2 в процессе)
    ('2025-12-01', 'Fine-tuning модели BERT для задачи классификации текстовой тональности (sentiment analysis).', '2025-12-10', TRUE, 8),
    ('2025-12-05', 'Эксперименты с few-shot и zero-shot learning для NLP задач.', '2025-12-15', FALSE, 8),
    ('2025-12-08', 'Разработка pipeline для автоматической генерации текстовых отчетов.', '2025-12-18', FALSE, 8),
    
    -- Дополнительные задания для студентов (для более полного покрытия)
    ('2025-09-08', 'Разработать модуль импорта/экспорта данных в форматах CSV, Excel, JSON.', '2025-09-18', TRUE, 1),
    ('2025-09-28', 'Реализовать систему полнотекстового поиска по рабочим дневникам.', '2025-10-08', FALSE, 1),
    ('2025-10-03', 'Создать систему рекомендаций для студентов на основе предыдущих успешных практик.', '2025-10-13', FALSE, 3),
    ('2025-09-30', 'Разработать мобильное приложение для ведения рабочих дневников (React Native).', '2025-10-10', FALSE, 2),
    ('2025-10-08', 'Провести security audit кода. Выявить и исправить уязвимости.', '2025-10-18', FALSE, 5),
    ('2025-11-15', 'Разработать чат-бота для ответов на частые вопросы о практике.', '2025-11-25', FALSE, 4),
    ('2025-12-12', 'Создать систему автоматической проверки индивидуальных заданий с использованием ML.', '2025-12-22', FALSE, 8)
ON CONFLICT (individual_work_id) DO NOTHING;

-- 13. Руководители практик
INSERT INTO supervisor (practice_id, position_id, role_id, full_name) 
VALUES 
    (1, 3, 1, 'Смирнов Алексей Петрович'),
    (1, 1, 2, 'Воробьев Сергей Николаевич'),
    (2, 1, 2, 'Иванова Ольга Викторовна'),
    (2, 6, 3, 'Петров Андрей'),
    (3, 2, 4, 'Сидоров Павел Михайлович'),
    (4, 3, 1, 'Ковалева Мария Ивановна'),
    (5, 5, 2, 'Соколова Инна Владимировна'),
    (6, 7, 2, 'Орлов Денис Сергеевич'),
    (7, 9, 3, 'Волкова Елена'),
    (8, 11, 2, 'Захаров Игорь'),
    (9, 13, 3, 'Морозов Александр'),
    (10, 15, 1, 'директор Новиков Виктор')
ON CONFLICT (supervisor_id) DO NOTHING;
-- === ПРЕДСТАВЛЕНИЯ ===

-- Представление 1: Студенты и их группы (создаем сразу)
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
JOIN practice p ON s.practice_id = p.practice_id;

-- Представление 2: Практики с количеством студентов
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
GROUP BY p.practice_id, p.start_date, p.end_date, pl.location;

-- === ТРИГГЕРЫ ===

-- 1. Триггер для автоматической установки даты создания записи в дневнике
CREATE OR REPLACE FUNCTION set_diary_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.work_date IS NULL THEN
        NEW.work_date = CURRENT_DATE;
    END IF;
    IF NEW.created_at IS NULL THEN
        NEW.created_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS diary_date_trigger ON work_diary;
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

-- 3. Триггер для individual_work
CREATE OR REPLACE FUNCTION set_individual_work_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.created_at IS NULL THEN
        NEW.created_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS individual_work_date_trigger ON individual_work;
CREATE TRIGGER individual_work_date_trigger
BEFORE INSERT ON individual_work
FOR EACH ROW
EXECUTE FUNCTION set_individual_work_date();

-- 4. Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для обновления времени изменения
DROP TRIGGER IF EXISTS update_work_diary_updated_at ON work_diary;
CREATE TRIGGER update_work_diary_updated_at
BEFORE UPDATE ON work_diary
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_individual_work_updated_at ON individual_work;
CREATE TRIGGER update_individual_work_updated_at
BEFORE UPDATE ON individual_work
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

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

-- 3. Функция для проверки, что студент может редактировать только свои записи
CREATE OR REPLACE FUNCTION check_student_ownership()
RETURNS TRIGGER AS $$
DECLARE
    current_student_id INTEGER;
BEGIN
    -- Получаем student_id текущего пользователя (нужно передавать через сессию, но для простоты)
    -- В реальном приложении здесь будет проверка через JWT или сессию
    RETURN NEW;
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