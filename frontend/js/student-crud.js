class StudentCRUD {
    constructor() {
        this.api = api;
        this.auth = auth;
        this.currentEditId = null;
        this.currentEditType = null; // 'diary' or 'individual'
    }

    // ===== ДНЕВНИК ПРАКТИКИ =====
    
    async loadDiary() {
        try {
            const user = this.auth.getCurrentUser();
            const diary = await this.api.getStudentDiary(user.id);
            this.renderDiaryEntries(diary);
            return diary;
        } catch (error) {
            this.showAlert(`Ошибка загрузки дневника: ${error.message}`, 'error');
            return [];
        }
    }

    renderDiaryEntries(entries) {
        const tbody = document.getElementById('diaryEntries');
        if (!tbody) return;
        
        if (!entries || entries.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: #999;">
                        Нет записей в дневнике
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = entries.map(entry => `
            <tr data-id="${entry.entry_id}">
                <td>${this.formatDate(entry.work_date)}</td>
                <td>${entry.description}</td>
                <td>${this.formatDateTime(entry.created_at)}</td>
                <td>${entry.updated_at ? this.formatDateTime(entry.updated_at) : '—'}</td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="btn btn-outline btn-sm" onclick="studentCRUD.editDiaryEntry(${entry.entry_id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline btn-sm btn-danger" onclick="studentCRUD.deleteDiaryEntry(${entry.entry_id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
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
            
            document.getElementById('diaryDescription').value = '';
            this.showAlert('Запись успешно добавлена', 'success');
            await this.loadDiary();
        } catch (error) {
            this.showAlert(`Ошибка при добавлении записи: ${error.message}`, 'error');
        }
    }

    async editDiaryEntry(entryId) {
        try {
            const user = this.auth.getCurrentUser();
            const entry = await this.api.getDiaryEntry(entryId, user.id);
            
            // Заполняем форму редактирования
            document.getElementById('editWorkDate').value = entry.work_date;
            document.getElementById('editDiaryDescription').value = entry.description;
            
            this.currentEditId = entryId;
            this.currentEditType = 'diary';
            
            // Показываем модальное окно
            this.showModal('editDiaryModal');
        } catch (error) {
            this.showAlert(`Ошибка загрузки записи: ${error.message}`, 'error');
        }
    }

    async updateDiaryEntry() {
        const description = document.getElementById('editDiaryDescription')?.value.trim();
        const workDate = document.getElementById('editWorkDate')?.value;
        
        if (!description) {
            this.showAlert('Введите описание работы', 'error');
            return;
        }

        try {
            const user = this.auth.getCurrentUser();
            await this.api.updateDiaryEntry(
                this.currentEditId,
                user.id,
                workDate,
                description
            );
            
            this.hideModal('editDiaryModal');
            this.showAlert('Запись успешно обновлена', 'success');
            await this.loadDiary();
        } catch (error) {
            this.showAlert(`Ошибка при обновлении записи: ${error.message}`, 'error');
        }
    }

    async deleteDiaryEntry(entryId) {
        if (!confirm('Вы уверены, что хотите удалить эту запись?')) {
            return;
        }

        try {
            const user = this.auth.getCurrentUser();
            await this.api.deleteDiaryEntry(entryId, user.id);
            
            this.showAlert('Запись успешно удалена', 'success');
            await this.loadDiary();
        } catch (error) {
            this.showAlert(`Ошибка при удалении записи: ${error.message}`, 'error');
        }
    }

    // ===== ИНДИВИДУАЛЬНЫЕ ЗАДАНИЯ =====
    
    async loadIndividualWorks() {
        try {
            const user = this.auth.getCurrentUser();
            const works = await this.api.getIndividualWorks(user.id);
            this.renderIndividualWorks(works);
            return works;
        } catch (error) {
            this.showAlert(`Ошибка загрузки заданий: ${error.message}`, 'error');
            return [];
        }
    }

    renderIndividualWorks(works) {
        const tbody = document.getElementById('individualWorks');
        if (!tbody) return;
        
        if (!works || works.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: #999;">
                        Нет индивидуальных заданий
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = works.map(work => `
            <tr data-id="${work.individual_work_id}">
                <td>${this.formatDate(work.issue_date)}</td>
                <td>${work.work_description}</td>
                <td>${this.formatDate(work.issue_deadline)}</td>
                <td>
                    <input type="checkbox" 
                           ${work.complete_mark ? 'checked' : ''}
                           onchange="studentCRUD.toggleWorkCompletion(${work.individual_work_id}, this.checked)">
                </td>
                <td>${this.formatDateTime(work.created_at)}</td>
                <td>${work.updated_at ? this.formatDateTime(work.updated_at) : '—'}</td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="btn btn-outline btn-sm" onclick="studentCRUD.editIndividualWork(${work.individual_work_id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline btn-sm btn-danger" onclick="studentCRUD.deleteIndividualWork(${work.individual_work_id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async addIndividualWork() {
        const issueDate = document.getElementById('issueDate')?.value;
        const description = document.getElementById('workDescription')?.value.trim();
        const deadline = document.getElementById('workDeadline')?.value;
        const completeMark = document.getElementById('completeMark')?.checked || false;
        
        if (!description) {
            this.showAlert('Введите описание задания', 'error');
            return;
        }

        if (!issueDate) {
            this.showAlert('Выберите дату выдачи', 'error');
            return;
        }

        if (!deadline) {
            this.showAlert('Выберите срок выполнения', 'error');
            return;
        }

        try {
            const user = this.auth.getCurrentUser();
            await this.api.addIndividualWork(
                user.id,
                issueDate,
                description,
                deadline,
                completeMark
            );
            
            // Очищаем форму
            document.getElementById('issueDate').value = '';
            document.getElementById('workDescription').value = '';
            document.getElementById('workDeadline').value = '';
            document.getElementById('completeMark').checked = false;
            
            this.showAlert('Задание успешно добавлено', 'success');
            await this.loadIndividualWorks();
        } catch (error) {
            this.showAlert(`Ошибка при добавлении задания: ${error.message}`, 'error');
        }
    }

    async editIndividualWork(workId) {
        try {
            const user = this.auth.getCurrentUser();
            const work = await this.api.getIndividualWork(workId, user.id);
            
            // Заполняем форму редактирования
            document.getElementById('editIssueDate').value = work.issue_date;
            document.getElementById('editWorkDescription').value = work.work_description;
            document.getElementById('editWorkDeadline').value = work.issue_deadline;
            document.getElementById('editCompleteMark').checked = work.complete_mark;
            
            this.currentEditId = workId;
            this.currentEditType = 'individual';
            
            // Показываем модальное окно
            this.showModal('editIndividualModal');
        } catch (error) {
            this.showAlert(`Ошибка загрузки задания: ${error.message}`, 'error');
        }
    }

    async updateIndividualWork() {
        const issueDate = document.getElementById('editIssueDate')?.value;
        const description = document.getElementById('editWorkDescription')?.value.trim();
        const deadline = document.getElementById('editWorkDeadline')?.value;
        const completeMark = document.getElementById('editCompleteMark')?.checked || false;
        
        if (!description) {
            this.showAlert('Введите описание задания', 'error');
            return;
        }

        try {
            const user = this.auth.getCurrentUser();
            await this.api.updateIndividualWork(this.currentEditId, user.id, {
                issue_date: issueDate,
                work_description: description,
                issue_deadline: deadline,
                complete_mark: completeMark
            });
            
            this.hideModal('editIndividualModal');
            this.showAlert('Задание успешно обновлено', 'success');
            await this.loadIndividualWorks();
        } catch (error) {
            this.showAlert(`Ошибка при обновлении задания: ${error.message}`, 'error');
        }
    }

    async deleteIndividualWork(workId) {
        if (!confirm('Вы уверены, что хотите удалить это задание?')) {
            return;
        }

        try {
            const user = this.auth.getCurrentUser();
            await this.api.deleteIndividualWork(workId, user.id);
            
            this.showAlert('Задание успешно удалено', 'success');
            await this.loadIndividualWorks();
        } catch (error) {
            this.showAlert(`Ошибка при удалении задания: ${error.message}`, 'error');
        }
    }

    async toggleWorkCompletion(workId, completed) {
        try {
            const user = this.auth.getCurrentUser();
            await this.api.updateIndividualWork(workId, user.id, {
                complete_mark: completed
            });
            
            this.showAlert('Статус задания обновлен', 'success');
        } catch (error) {
            this.showAlert(`Ошибка при обновлении статуса: ${error.message}`, 'error');
        }
    }

    // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
    
    formatDate(dateString) {
        if (!dateString) return '—';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU');
        } catch (e) {
            return dateString;
        }
    }

    formatDateTime(dateTimeString) {
        if (!dateTimeString) return '—';
        try {
            const date = new Date(dateTimeString);
            return date.toLocaleString('ru-RU');
        } catch (e) {
            return dateTimeString;
        }
    }

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" 
                    style="margin-left: auto; background: none; border: none; cursor: pointer;">×</button>
        `;
        
        const container = document.querySelector('main');
        if (container) {
            container.insertBefore(alertDiv, container.firstChild);
            setTimeout(() => alertDiv.remove(), 5000);
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            this.currentEditId = null;
            this.currentEditType = null;
        }
    }

    // Инициализация
    async init() {
        if (!this.auth.isAuthenticated()) {
            return;
        }

        try {
            await Promise.all([
                this.loadDiary(),
                this.loadIndividualWorks()
            ]);
            
            this.setupEventListeners();
        } catch (error) {
            console.error('Ошибка инициализации StudentCRUD:', error);
        }
    }

    setupEventListeners() {
        // События для модальных окон
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Закрытие модальных окон по клику вне контента
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }
}

const studentCRUD = new StudentCRUD();