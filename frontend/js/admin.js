class AdminPanel {
    constructor() {
        this.api = api;
        this.auth = auth;
        this.lastResult = null;
        this.init();
    }

    init() {
        if (!this.auth.requireAdmin()) return;
        
        this.setupEventListeners();
        this.loadStats();
        this.setupTabs();
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
    }

    switchTab(tabId) {
        // Hide all tabs
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Show selected tab
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');
    }

    async loadStats() {
        try {
            const [users, practices, diary] = await Promise.all([
                this.api.getAllUsers(),
                this.api.getAllPractices(),
                this.api.getAllDiaryEntries()
            ]);
            
            document.getElementById('totalUsers').textContent = users.length;
            document.getElementById('totalPractices').textContent = practices.length;
            document.getElementById('totalDiaryEntries').textContent = diary.length;
            document.getElementById('activeStudents').textContent = 
                users.filter(u => u.username.startsWith('student')).length;
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async executeQuery(queryType, ...args) {
        const queryMap = {
            'users': () => this.api.getAllUsers(),
            'practices': () => this.api.getAllPractices(),
            'students-groups': () => this.api.getAllStudentsWithGroups(),
            'diary': () => this.api.getAllDiaryEntries(),
            'admins': () => this.api.getAdminUsers(),
            'students-recent-diary': () => this.api.getStudentsWithRecentDiary(),
            'students-practice-location': () => this.api.getStudentsWithPracticeLocation(),
            'supervisors-details': () => this.api.getSupervisorsWithDetails(),
            'student-groups-view': () => this.api.getStudentGroupsView(),
            'practice-students-view': () => this.api.getPracticeStudentsView()
        };

        try {
            const result = await queryMap[queryType]();
            this.displayResult(result, queryType);
            this.lastResult = result;
        } catch (error) {
            this.showAlert(`Ошибка выполнения запроса: ${error.message}`, 'error');
        }
    }

    async executeDynamicQuery() {
        const query = document.getElementById('dynamicQuery').value.trim();
        if (!query) {
            this.showAlert('Введите SQL запрос', 'error');
            return;
        }

        try {
            const result = await this.api.executeDynamicQuery(query);
            this.displayResult(result.rows, 'dynamic');
            this.lastResult = result.rows;
        } catch (error) {
            this.showAlert(`Ошибка: ${error.message}`, 'error');
        }
    }

    async executeFunction(funcType, ...args) {
        try {
            let result;
            switch(funcType) {
                case 'students-count':
                    const practiceId = prompt('Введите ID практики:', '1');
                    if (practiceId) {
                        result = await this.api.getStudentsCountOnPractice(practiceId);
                    }
                    break;
                case 'avg-diary':
                    result = await this.api.getAvgDiaryEntries();
                    break;
            }
            
            if (result) {
                this.displayResult(result, funcType);
                this.lastResult = result;
            }
        } catch (error) {
            this.showAlert(`Ошибка выполнения функции: ${error.message}`, 'error');
        }
    }

    async executeProcedure(procType) {
        try {
            let result;
            switch(procType) {
                case 'add-student':
                    const studentData = {
                        username: prompt('Имя пользователя:', 'new_student'),
                        password: prompt('Пароль:', '123'),
                        full_name: prompt('Полное имя:', 'Новый Студент'),
                        group_id: prompt('ID группы:', '1'),
                        practice_id: prompt('ID практики:', '1')
                    };
                    result = await this.api.addStudentProcedure(studentData);
                    break;
                case 'close-practice':
                    const practiceData = {
                        practice_id: prompt('ID практики:', '1'),
                        end_date: prompt('Дата окончания (ГГГГ-ММ-ДД):', '2025-12-31')
                    };
                    result = await this.api.closePracticeProcedure(practiceData);
                    break;
            }
            
            if (result) {
                this.displayResult(result, procType);
                this.lastResult = result;
            }
        } catch (error) {
            this.showAlert(`Ошибка выполнения процедуры: ${error.message}`, 'error');
        }
    }

    async executeTransaction(transType) {
        try {
            let result;
            switch(transType) {
                case 'move-student':
                    const moveData = {
                        student_id: prompt('ID студента:', '1'),
                        new_group_id: prompt('Новый ID группы:', '2')
                    };
                    result = await this.api.moveStudentTransaction(moveData);
                    break;
                case 'delete-student':
                    const deleteData = {
                        student_id: prompt('ID студента для удаления:', '3')
                    };
                    result = await this.api.deleteStudentTransaction(deleteData);
                    break;
            }
            
            if (result) {
                this.displayResult(result, transType);
                this.lastResult = result;
            }
        } catch (error) {
            this.showAlert(`Ошибка выполнения транзакции: ${error.message}`, 'error');
        }
    }

    displayResult(data, title) {
        const resultArea = document.getElementById('queryResult');
        if (!resultArea) return;

        let html = `<h3>Результат: ${this.getQueryTitle(title)}</h3>`;
        
        if (Array.isArray(data) && data.length > 0) {
            const headers = Object.keys(data[0]);
            html += `
                <table class="result-table">
                    <thead>
                        <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr>${headers.map(h => `<td>${row[h]}</td>`).join('')}</tr>
                        `).join('')}
                    </tbody>
                </table>
                <p class="mt-3">Найдено записей: ${data.length}</p>
            `;
        } else if (typeof data === 'object') {
            html += '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        } else {
            html += `<p>${data}</p>`;
        }

        resultArea.innerHTML = html;
    }

    getQueryTitle(type) {
        const titles = {
            'users': 'Все пользователи',
            'practices': 'Все практики',
            'students-groups': 'Студенты с группами',
            'diary': 'Все записи дневника',
            'admins': 'Администраторы',
            'students-recent-diary': 'Студенты с записями за 7 дней',
            'students-practice-location': 'Студенты с местами практики',
            'supervisors-details': 'Руководители с деталями',
            'student-groups-view': 'Представление студентов и групп',
            'practice-students-view': 'Представление практик с количеством студентов',
            'dynamic': 'Динамический запрос',
            'students-count': 'Количество студентов на практике',
            'avg-diary': 'Среднее количество записей в дневнике',
            'add-student': 'Добавление студента',
            'close-practice': 'Закрытие практики',
            'move-student': 'Перемещение студента',
            'delete-student': 'Удаление студента'
        };
        
        return titles[type] || type;
    }

    generatePDF() {
        if (!this.lastResult) {
            this.showAlert('Нет данных для генерации отчета', 'error');
            return;
        }

        // Используем pdfGenerator.js
        if (typeof generatePDF === 'function') {
            generatePDF(this.lastResult, 'Отчет системы практик');
        } else {
            this.showAlert('Функция генерации PDF недоступна', 'error');
        }
    }

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="margin-left: auto; background: none; border: none; cursor: pointer;">×</button>
        `;
        
        const container = document.querySelector('main');
        container.insertBefore(alertDiv, container.firstChild);
        
        setTimeout(() => alertDiv.remove(), 5000);
    }

    setupEventListeners() {
        // Query buttons
        const queryButtons = document.querySelectorAll('[data-query]');
        queryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.executeQuery(btn.dataset.query);
            });
        });

        // Function buttons
        const functionButtons = document.querySelectorAll('[data-function]');
        functionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.executeFunction(btn.dataset.function);
            });
        });

        // Procedure buttons
        const procedureButtons = document.querySelectorAll('[data-procedure]');
        procedureButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.executeProcedure(btn.dataset.procedure);
            });
        });

        // Transaction buttons
        const transactionButtons = document.querySelectorAll('[data-transaction]');
        transactionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.executeTransaction(btn.dataset.transaction);
            });
        });

        // Dynamic query
        const executeBtn = document.getElementById('executeDynamicQuery');
        if (executeBtn) {
            executeBtn.addEventListener('click', () => this.executeDynamicQuery());
        }

        // Generate PDF
        const generatePDFBtn = document.getElementById('generatePDF');
        if (generatePDFBtn) {
            generatePDFBtn.addEventListener('click', () => this.generatePDF());
        }
    }
}

const adminPanel = new AdminPanel();