class StudentDashboard {
    constructor() {
        this.api = api;
        this.auth = auth;
        this.init();
    }

    async init() {
        if (!this.auth.requireAuth()) return;
        
        await this.loadProfile();
        await this.loadDiary();
        await this.loadIndividualWorks();
        this.setupEventListeners();
    }

    async loadProfile() {
        try {
            const user = this.auth.getCurrentUser();
            const profile = await this.api.getStudentProfile(user.id);
            
            document.getElementById('studentName').textContent = profile.full_name || user.fullName;
            document.getElementById('studentGroup').textContent = profile.group_name || 'Не указана';
            document.getElementById('practicePeriod').textContent = 
                `${this.formatDate(profile.start_date)} - ${this.formatDate(profile.end_date)}`;
            document.getElementById('practiceLocation').textContent = profile.location || 'Не указано';
            
            this.renderSupervisors(profile.supervisors || []);
        } catch (error) {
            this.showAlert('Ошибка при загрузке профиля', 'error');
        }
    }

    async loadDiary() {
        try {
            const user = this.auth.getCurrentUser();
            const diary = await this.api.getStudentDiary(user.id);
            
            const tbody = document.getElementById('diaryEntries');
            tbody.innerHTML = diary.map(entry => `
                <tr>
                    <td>${this.formatDate(entry.work_date)}</td>
                    <td>${entry.description}</td>
                    <td>${this.formatDate(entry.created_at)}</td>
                </tr>
            `).join('');
        } catch (error) {
            this.showAlert('Ошибка при загрузке дневника', 'error');
        }
    }

    async loadIndividualWorks() {
        try {
            const user = this.auth.getCurrentUser();
            const works = await this.api.getIndividualWorks(user.id);
            
            const tbody = document.getElementById('individualWorks');
            tbody.innerHTML = works.map(work => `
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
        } catch (error) {
            this.showAlert('Ошибка при загрузке заданий', 'error');
        }
    }

    async addDiaryEntry() {
        const description = document.getElementById('diaryDescription').value.trim();
        const workDate = document.getElementById('workDate').value;
        
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
            
            document.getElementById('diaryDescription').value = '';
            document.getElementById('workDate').value = '';
            
            this.showAlert('Запись успешно добавлена', 'success');
            await this.loadDiary();
        } catch (error) {
            this.showAlert('Ошибка при добавлении записи', 'error');
        }
    }

    async updateWorkStatus(workId, completed) {
        try {
            await this.api.updateIndividualWork(workId, completed);
            this.showAlert('Статус обновлен', 'success');
        } catch (error) {
            this.showAlert('Ошибка при обновлении статуса', 'error');
        }
    }

    viewWorkDetails(workId) {
        // Можно добавить модальное окно с деталями
        alert(`Просмотр задания ID: ${workId}`);
    }

    renderSupervisors(supervisors) {
        const container = document.getElementById('supervisorsList');
        if (!container) return;
        
        if (supervisors.length === 0) {
            container.innerHTML = '<p>Руководители не назначены</p>';
            return;
        }
        
        container.innerHTML = supervisors.map(supervisor => `
            <div class="supervisor-item">
                <h4>${supervisor.full_name}</h4>
                <p><strong>Должность:</strong> ${supervisor.position_name}</p>
                <p><strong>Организация:</strong> ${supervisor.organization_name}</p>
                <p><strong>Роль:</strong> ${supervisor.role_name}</p>
            </div>
        `).join('');
    }

    formatDate(dateString) {
        if (!dateString) return 'Не указано';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
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
        const addBtn = document.getElementById('addDiaryEntry');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addDiaryEntry());
        }
    }
}

const studentDashboard = new StudentDashboard();