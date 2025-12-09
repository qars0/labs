class StudentDashboard {
    constructor() {
        this.api = api;
        this.auth = auth;
    }

    async init() {
        if (!this.auth.isAuthenticated()) {
            this.showError('Пользователь не авторизован');
            return;
        }

        try {
            await Promise.all([
                this.loadProfile(),
                this.loadDiary(),
                this.loadIndividualWorks()
            ]);
            this.setupEventListeners();
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.showError('Ошибка загрузки данных');
        }
    }

    async loadProfile() {
        try {
            const user = this.auth.getCurrentUser();
            const profile = await this.api.getStudentProfile(user.id);
            
            // Создаем HTML для профиля
            const profileHTML = `
                <div class="card">
                    <h3><i class="fas fa-id-card"></i> Информация о практике</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                        <div>
                            <p><strong>ФИО студента:</strong></p>
                            <h2 style="color: #667eea;">${profile.full_name || user.fullName}</h2>
                        </div>
                        <div>
                            <p><strong>Учебная группа:</strong></p>
                            <h3>${profile.group_name || 'Не указана'}</h3>
                        </div>
                        <div>
                            <p><strong>Период практики:</strong></p>
                            <h3>${this.formatDate(profile.start_date)} - ${this.formatDate(profile.end_date)}</h3>
                        </div>
                        <div>
                            <p><strong>Место практики:</strong></p>
                            <h3>${profile.location || 'Не указано'}</h3>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h3><i class="fas fa-chalkboard-teacher"></i> Руководители практики</h3>
                    <div id="supervisorsList" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                        ${this.renderSupervisors(profile.supervisors || [])}
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 30px;">
                    <div class="card">
                        <h3><i class="fas fa-book"></i> Дневник практики</h3>
                        
                        <div class="form-group">
                            <label for="workDate">Дата выполнения работы</label>
                            <input type="date" id="workDate" class="form-control" value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        
                        <div class="form-group">
                            <label for="diaryDescription">Описание выполненной работы</label>
                            <textarea id="diaryDescription" class="form-control" 
                                      placeholder="Опишите работу, выполненную сегодня..."></textarea>
                        </div>
                        
                        <button onclick="studentDashboard.addDiaryEntry()" class="btn btn-primary">
                            <i class="fas fa-plus"></i> Добавить запись
                        </button>
                        
                        <h4 style="margin-top: 30px; margin-bottom: 15px;">Предыдущие записи</h4>
                        <div style="max-height: 300px; overflow-y: auto;">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Дата</th>
                                        <th>Описание работы</th>
                                        <th>Дата добавления</th>
                                    </tr>
                                </thead>
                                <tbody id="diaryEntries">
                                    ${this.renderDiaryEntries([])}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="card">
                        <h3><i class="fas fa-tasks"></i> Индивидуальные задания</h3>
                        
                        <div style="max-height: 400px; overflow-y: auto;">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Дата выдачи</th>
                                        <th>Описание</th>
                                        <th>Срок сдачи</th>
                                        <th>Выполнено</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody id="individualWorks">
                                    ${this.renderIndividualWorks([])}
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="alert alert-info" style="margin-top: 15px;">
                            <i class="fas fa-info-circle"></i> 
                            Отмечайте выполненные задания, устанавливая флажок в столбце "Выполнено"
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('content').innerHTML = profileHTML;
            
            // После отрисовки загружаем динамические данные
            await this.loadDiaryData();
            await this.loadIndividualWorksData();
            
        } catch (error) {
            console.error('Ошибка загрузки профиля:', error);
            throw error;
        }
    }

    async loadDiaryData() {
        try {
            const user = this.auth.getCurrentUser();
            const diary = await this.api.getStudentDiary(user.id);
            
            const tbody = document.getElementById('diaryEntries');
            if (tbody) {
                tbody.innerHTML = this.renderDiaryEntries(diary);
            }
        } catch (error) {
            console.error('Ошибка загрузки дневника:', error);
        }
    }

    async loadIndividualWorksData() {
        try {
            const user = this.auth.getCurrentUser();
            const works = await this.api.getIndividualWorks(user.id);
            
            const tbody = document.getElementById('individualWorks');
            if (tbody) {
                tbody.innerHTML = this.renderIndividualWorks(works);
            }
        } catch (error) {
            console.error('Ошибка загрузки заданий:', error);
        }
    }

    renderDiaryEntries(entries) {
        if (!entries || entries.length === 0) {
            return `
                <tr>
                    <td colspan="3" style="text-align: center; color: #999;">
                        Нет записей в дневнике
                    </td>
                </tr>
            `;
        }
        
        return entries.map(entry => `
            <tr>
                <td>${this.formatDate(entry.work_date)}</td>
                <td>${entry.description}</td>
                <td>${this.formatDate(entry.created_at)}</td>
            </tr>
        `).join('');
    }

    renderIndividualWorks(works) {
        if (!works || works.length === 0) {
            return `
                <tr>
                    <td colspan="5" style="text-align: center; color: #999;">
                        Нет индивидуальных заданий
                    </td>
                </tr>
            `;
        }
        
        return works.map(work => `
            <tr>
                <td>${this.formatDate(work.issue_date)}</td>
                <td>${work.work_description}</td>
                <td>${this.formatDate(work.issue_deadline)}</td>
                <td>
                    <input type="checkbox" 
                           ${work.complete_mark ? 'checked' : ''}
                           onchange="studentDashboard.updateWorkStatus(${work.individual_work_id}, this.checked)">
                </td>
                <td>
                    <button class="btn btn-outline btn-sm" 
                            onclick="studentDashboard.viewWorkDetails(${work.individual_work_id})">
                        Подробнее
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderSupervisors(supervisors) {
        if (!supervisors || supervisors.length === 0) {
            return '<p>Руководители не назначены</p>';
        }
        
        return supervisors.map(supervisor => `
            <div class="supervisor-item">
                <h4>${supervisor.full_name}</h4>
                <p><strong>Должность:</strong> ${supervisor.position_name}</p>
                <p><strong>Организация:</strong> ${supervisor.organization_name}</p>
                <p><strong>Роль:</strong> ${supervisor.role_name}</p>
            </div>
        `).join('');
    }

    async addDiaryEntry() {
        const description = document.getElementById('diaryDescription')?.value.trim();
        const workDate = document.getElementById('workDate')?.value;
        
        if (!description) {
            this.showAlert('Введите описание работы', 'error');
            return;
        }

        try {
            const user = this.auth.getCurrentUser();
            await this.api.addDiaryEntry(
                user.id,
                workDate || new Date().toISOString().split('T')[0],
                description
            );
            
            if (document.getElementById('diaryDescription')) {
                document.getElementById('diaryDescription').value = '';
            }
            
            this.showAlert('Запись успешно добавлена', 'success');
            await this.loadDiaryData();
        } catch (error) {
            console.error('Ошибка при добавлении записи:', error);
            this.showAlert('Ошибка при добавлении записи', 'error');
        }
    }

    async updateWorkStatus(workId, completed) {
        try {
            await this.api.updateIndividualWork(workId, completed);
            this.showAlert('Статус обновлен', 'success');
        } catch (error) {
            console.error('Ошибка при обновлении статуса:', error);
            this.showAlert('Ошибка при обновлении статуса', 'error');
        }
    }

    viewWorkDetails(workId) {
        alert(`Просмотр задания ID: ${workId}`);
    }

    formatDate(dateString) {
        if (!dateString) return 'Не указано';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU');
        } catch (e) {
            return dateString;
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
        if (container) {
            container.insertBefore(alertDiv, container.firstChild);
            setTimeout(() => alertDiv.remove(), 5000);
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('error');
        const contentDiv = document.getElementById('content');
        const loadingDiv = document.getElementById('loading');
        
        if (errorDiv) {
            errorDiv.style.display = 'block';
            errorDiv.innerHTML = `
                <h3 style="color: #dc3545;"><i class="fas fa-exclamation-triangle"></i> ${message}</h3>
                <p>Пожалуйста, войдите в систему или обратитесь к администратору.</p>
                <a href="login.html" class="btn btn-primary">Войти</a>
                <a href="index.html" class="btn btn-outline">На главную</a>
            `;
        }
        
        if (contentDiv) contentDiv.style.display = 'none';
        if (loadingDiv) loadingDiv.style.display = 'none';
    }

    setupEventListeners() {
        // Добавляем обработчики событий после загрузки DOM
        setTimeout(() => {
            const addBtn = document.getElementById('addDiaryEntry');
            if (addBtn) {
                addBtn.addEventListener('click', () => this.addDiaryEntry());
            }
        }, 100);
    }
}

const studentDashboard = new StudentDashboard();