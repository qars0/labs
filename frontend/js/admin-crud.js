class AdminCRUD {
    constructor() {
        this.api = api;
        this.auth = auth;
        this.currentEditData = {};
    }

    async init() {
        if (!this.auth.requireAdmin()) return;
        
        this.setupEventListeners();
        await this.loadAllData();
    }

    async loadAllData() {
        try {
            const [locations, groups, roles, positions, supervisors, organizations, practices] = await Promise.all([
                this.api.getLocations(),
                this.api.getGroups(),
                this.api.getRoles(),
                this.api.getPositions(),
                this.api.getSupervisors(),
                this.api.getOrganizations(),
                this.api.getPractices()
            ]);

            this.locations = locations;
            this.groups = groups;
            this.roles = roles;
            this.positions = positions;
            this.supervisors = supervisors;
            this.organizations = organizations;
            this.practices = practices;

            this.renderTables();
        } catch (error) {
            this.showAlert(`Ошибка загрузки данных: ${error.message}`, 'error');
        }
    }

    renderTables() {
        this.renderLocations();
        this.renderGroups();
        this.renderRoles();
        this.renderPositions();
        this.renderSupervisors();
        this.populateSelects();
    }

    renderLocations() {
        const tbody = document.getElementById('locationsTable');
        if (!tbody) return;

        if (!this.locations || this.locations.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; color: #999;">
                        Нет локаций
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.locations.map(location => `
            <tr data-id="${location.location_id}">
                <td>${location.location_id}</td>
                <td>
                    <input type="text" class="form-control" 
                           value="${location.location || ''}" 
                           data-field="location"
                           style="width: 100%;">
                </td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="btn btn-outline btn-sm" 
                                onclick="adminCRUD.updateLocation(${location.location_id})">
                            <i class="fas fa-save"></i>
                        </button>
                        <button class="btn btn-outline btn-sm btn-danger" 
                                onclick="adminCRUD.deleteLocation(${location.location_id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderGroups() {
        const tbody = document.getElementById('groupsTable');
        if (!tbody) return;

        if (!this.groups || this.groups.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; color: #999;">
                        Нет групп
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.groups.map(group => `
            <tr data-id="${group.group_id}">
                <td>${group.group_id}</td>
                <td>
                    <input type="text" class="form-control" 
                           value="${group.group_name || ''}" 
                           data-field="group_name"
                           style="width: 100%;">
                </td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="btn btn-outline btn-sm" 
                                onclick="adminCRUD.updateGroup(${group.group_id})">
                            <i class="fas fa-save"></i>
                        </button>
                        <button class="btn btn-outline btn-sm btn-danger" 
                                onclick="adminCRUD.deleteGroup(${group.group_id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderRoles() {
        const tbody = document.getElementById('rolesTable');
        if (!tbody) return;

        if (!this.roles || this.roles.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; color: #999;">
                        Нет ролей
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.roles.map(role => `
            <tr data-id="${role.role_id}">
                <td>${role.role_id}</td>
                <td>
                    <input type="text" class="form-control" 
                           value="${role.role_name || ''}" 
                           data-field="role_name"
                           style="width: 100%;">
                </td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="btn btn-outline btn-sm" 
                                onclick="adminCRUD.updateRole(${role.role_id})">
                            <i class="fas fa-save"></i>
                        </button>
                        <button class="btn btn-outline btn-sm btn-danger" 
                                onclick="adminCRUD.deleteRole(${role.role_id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderPositions() {
        const tbody = document.getElementById('positionsTable');
        if (!tbody) return;

        if (!this.positions || this.positions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #999;">
                        Нет должностей
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.positions.map(position => `
            <tr data-id="${position.position_id}">
                <td>${position.position_id}</td>
                <td>
                    <input type="text" class="form-control" 
                           value="${position.position_name || ''}" 
                           data-field="position_name"
                           style="width: 100%;">
                </td>
                <td>
                    <select class="form-control" data-field="organization_id" style="width: 100%;">
                        ${this.organizations.map(org => `
                            <option value="${org.organization_id}" 
                                    ${org.organization_id == position.organization_id ? 'selected' : ''}>
                                ${org.organization_name}
                            </option>
                        `).join('')}
                    </select>
                </td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="btn btn-outline btn-sm" 
                                onclick="adminCRUD.updatePosition(${position.position_id})">
                            <i class="fas fa-save"></i>
                        </button>
                        <button class="btn btn-outline btn-sm btn-danger" 
                                onclick="adminCRUD.deletePosition(${position.position_id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderSupervisors() {
        const tbody = document.getElementById('supervisorsTable');
        if (!tbody) return;

        if (!this.supervisors || this.supervisors.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: #999;">
                        Нет руководителей
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.supervisors.map(supervisor => `
            <tr data-id="${supervisor.supervisor_id}">
                <td>${supervisor.supervisor_id}</td>
                <td>
                    <input type="text" class="form-control" 
                           value="${supervisor.full_name || ''}" 
                           data-field="full_name"
                           style="width: 100%;">
                </td>
                <td>
                    <select class="form-control" data-field="practice_id" style="width: 100%;">
                        ${this.practices.map(p => `
                            <option value="${p.practice_id}" 
                                    ${p.practice_id == supervisor.practice_id ? 'selected' : ''}>
                                Практика #${p.practice_id} (${this.formatDate(p.start_date)} - ${this.formatDate(p.end_date)})
                            </option>
                        `).join('')}
                    </select>
                </td>
                <td>
                    <select class="form-control" data-field="position_id" style="width: 100%;">
                        ${this.positions.map(p => `
                            <option value="${p.position_id}" 
                                    ${p.position_id == supervisor.position_id ? 'selected' : ''}>
                                ${p.position_name} (${p.organization_name})
                            </option>
                        `).join('')}
                    </select>
                </td>
                <td>
                    <select class="form-control" data-field="role_id" style="width: 100%;">
                        ${this.roles.map(r => `
                            <option value="${r.role_id}" 
                                    ${r.role_id == supervisor.role_id ? 'selected' : ''}>
                                ${r.role_name}
                            </option>
                        `).join('')}
                    </select>
                </td>
                <td>${supervisor.organization_name}</td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="btn btn-outline btn-sm" 
                                onclick="adminCRUD.updateSupervisor(${supervisor.supervisor_id})">
                            <i class="fas fa-save"></i>
                        </button>
                        <button class="btn btn-outline btn-sm btn-danger" 
                                onclick="adminCRUD.deleteSupervisor(${supervisor.supervisor_id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    populateSelects() {
        // Заполняем селекты в формах создания
        this.populateSelect('createPositionOrg', this.organizations, 'organization_id', 'organization_name');
        this.populateSelect('createSupervisorPractice', this.practices, 'practice_id', 'practice_id');
        this.populateSelect('createSupervisorPosition', this.positions, 'position_id', 'position_name');
        this.populateSelect('createSupervisorRole', this.roles, 'role_id', 'role_name');
    }

    populateSelect(selectId, data, valueField, textField) {
        const select = document.getElementById(selectId);
        if (!select || !data) return;

        select.innerHTML = `<option value="">Выберите...</option>` + 
            data.map(item => `
                <option value="${item[valueField]}">${item[textField]}</option>
            `).join('');
    }

    // === CRUD ОПЕРАЦИИ ===

    // Practice Locations
    async createLocation() {
        const location = document.getElementById('createLocation').value.trim();
        
        if (!location) {
            this.showAlert('Введите название локации', 'error');
            return;
        }

        try {
            await this.api.createLocation(location);
            document.getElementById('createLocation').value = '';
            this.showAlert('Локация успешно создана', 'success');
            await this.loadAllData();
        } catch (error) {
            this.showAlert(`Ошибка: ${error.message}`, 'error');
        }
    }

    async updateLocation(id) {
        const row = document.querySelector(`#locationsTable tr[data-id="${id}"]`);
        if (!row) return;

        const location = row.querySelector('[data-field="location"]').value.trim();
        
        if (!location) {
            this.showAlert('Название локации не может быть пустым', 'error');
            return;
        }

        try {
            await this.api.updateLocation(id, location);
            this.showAlert('Локация успешно обновлена', 'success');
            await this.loadAllData();
        } catch (error) {
            this.showAlert(`Ошибка: ${error.message}`, 'error');
        }
    }

    async deleteLocation(id) {
        if (!confirm('Вы уверены, что хотите удалить эту локацию?')) {
            return;
        }

        try {
            await this.api.deleteLocation(id);
            this.showAlert('Локация успешно удалена', 'success');
            await this.loadAllData();
        } catch (error) {
            this.showAlert(`Ошибка: ${error.message}`, 'error');
        }
    }

    // Student Groups
    async createGroup() {
        const group_name = document.getElementById('createGroup').value.trim();
        
        if (!group_name) {
            this.showAlert('Введите название группы', 'error');
            return;
        }

        try {
            await this.api.createGroup(group_name);
            document.getElementById('createGroup').value = '';
            this.showAlert('Группа успешно создана', 'success');
            await this.loadAllData();
        } catch (error) {
            this.showAlert(`Ошибка: ${error.message}`, 'error');
        }
    }

    async updateGroup(id) {
        const row = document.querySelector(`#groupsTable tr[data-id="${id}"]`);
        if (!row) return;

        const group_name = row.querySelector('[data-field="group_name"]').value.trim();
        
        if (!group_name) {
            this.showAlert('Название группы не может быть пустым', 'error');
            return;
        }

        try {
            await this.api.updateGroup(id, group_name);
            this.showAlert('Группа успешно обновлена', 'success');
            await this.loadAllData();
        } catch (error) {
            this.showAlert(`Ошибка: ${error.message}`, 'error');
        }
    }

    async deleteGroup(id) {
        if (!confirm('Вы уверены, что хотите удалить эту группу?')) {
            return;
        }

        try {
            await this.api.deleteGroup(id);
            this.showAlert('Группа успешно удалена', 'success');
            await this.loadAllData();
        } catch (error) {
            this.showAlert(`Ошибка: ${error.message}`, 'error');
        }
    }

    // Roles
    async createRole() {
        const role_name = document.getElementById('createRole').value.trim();
        
        if (!role_name) {
            this.showAlert('Введите название роли', 'error');
            return;
        }

        try {
            await this.api.createRole(role_name);
            document.getElementById('createRole').value = '';
            this.showAlert('Роль успешно создана', 'success');
            await this.loadAllData();
        } catch (error) {
            this.showAlert(`Ошибка: ${error.message}`, 'error');
        }
    }

    async updateRole(id) {
        const row = document.querySelector(`#rolesTable tr[data-id="${id}"]`);
        if (!row) return;

        const role_name = row.querySelector('[data-field="role_name"]').value.trim();
        
        if (!role_name) {
            this.showAlert('Название роли не может быть пустым', 'error');
            return;
        }

        try {
            await this.api.updateRole(id, role_name);
            this.showAlert('Роль успешно обновлена', 'success');
            await this.loadAllData();
        } catch (error) {
            this.showAlert(`Ошибка: ${error.message}`, 'error');
        }
    }

    async deleteRole(id) {
        if (!confirm('Вы уверены, что хотите удалить эту роль?')) {
            return;
        }

        try {
            await this.api.deleteRole(id);
            this.showAlert('Роль успешно удалена', 'success');
            await this.loadAllData();
        } catch (error) {
            this.showAlert(`Ошибка: ${error.message}`, 'error');
        }
    }

    // User Positions
    async createPosition() {
        const position_name = document.getElementById('createPositionName').value.trim();
        const organization_id = document.getElementById('createPositionOrg').value;
        
        if (!position_name) {
            this.showAlert('Введите название должности', 'error');
            return;
        }

        if (!organization_id) {
            this.showAlert('Выберите организацию', 'error');
            return;
        }

        try {
            await this.api.createPosition(position_name, organization_id);
            document.getElementById('createPositionName').value = '';
            document.getElementById('createPositionOrg').value = '';
            this.showAlert('Должность успешно создана', 'success');
            await this.loadAllData();
        } catch (error) {
            this.showAlert(`Ошибка: ${error.message}`, 'error');
        }
    }

    async updatePosition(id) {
        const row = document.querySelector(`#positionsTable tr[data-id="${id}"]`);
        if (!row) return;

        const position_name = row.querySelector('[data-field="position_name"]').value.trim();
        const organization_id = row.querySelector('[data-field="organization_id"]').value;
        
        if (!position_name) {
            this.showAlert('Название должности не может быть пустым', 'error');
            return;
        }

        if (!organization_id) {
            this.showAlert('Выберите организацию', 'error');
            return;
        }

        try {
            await this.api.updatePosition(id, position_name, organization_id);
            this.showAlert('Должность успешно обновлена', 'success');
            await this.loadAllData();
        } catch (error) {
            this.showAlert(`Ошибка: ${error.message}`, 'error');
        }
    }

    async deletePosition(id) {
        if (!confirm('Вы уверены, что хотите удалить эту должность?')) {
            return;
        }

        try {
            await this.api.deletePosition(id);
            this.showAlert('Должность успешно удалена', 'success');
            await this.loadAllData();
        } catch (error) {
            this.showAlert(`Ошибка: ${error.message}`, 'error');
        }
    }

    // Supervisors
    async createSupervisor() {
        const full_name = document.getElementById('createSupervisorName').value.trim();
        const practice_id = document.getElementById('createSupervisorPractice').value;
        const position_id = document.getElementById('createSupervisorPosition').value;
        const role_id = document.getElementById('createSupervisorRole').value;
        
        if (!full_name) {
            this.showAlert('Введите ФИО руководителя', 'error');
            return;
        }

        if (!practice_id) {
            this.showAlert('Выберите практику', 'error');
            return;
        }

        if (!position_id) {
            this.showAlert('Выберите должность', 'error');
            return;
        }

        if (!role_id) {
            this.showAlert('Выберите роль', 'error');
            return;
        }

        try {
            await this.api.createSupervisor(practice_id, position_id, role_id, full_name);
            document.getElementById('createSupervisorName').value = '';
            document.getElementById('createSupervisorPractice').value = '';
            document.getElementById('createSupervisorPosition').value = '';
            document.getElementById('createSupervisorRole').value = '';
            this.showAlert('Руководитель успешно создан', 'success');
            await this.loadAllData();
        } catch (error) {
            this.showAlert(`Ошибка: ${error.message}`, 'error');
        }
    }

    async updateSupervisor(id) {
        const row = document.querySelector(`#supervisorsTable tr[data-id="${id}"]`);
        if (!row) return;

        const full_name = row.querySelector('[data-field="full_name"]').value.trim();
        const practice_id = row.querySelector('[data-field="practice_id"]').value;
        const position_id = row.querySelector('[data-field="position_id"]').value;
        const role_id = row.querySelector('[data-field="role_id"]').value;
        
        if (!full_name) {
            this.showAlert('ФИО руководителя не может быть пустым', 'error');
            return;
        }

        try {
            await this.api.updateSupervisor(id, {
                full_name,
                practice_id,
                position_id,
                role_id
            });
            this.showAlert('Руководитель успешно обновлен', 'success');
            await this.loadAllData();
        } catch (error) {
            this.showAlert(`Ошибка: ${error.message}`, 'error');
        }
    }

    async deleteSupervisor(id) {
        if (!confirm('Вы уверены, что хотите удалить этого руководителя?')) {
            return;
        }

        try {
            await this.api.deleteSupervisor(id);
            this.showAlert('Руководитель успешно удален', 'success');
            await this.loadAllData();
        } catch (error) {
            this.showAlert(`Ошибка: ${error.message}`, 'error');
        }
    }

    // === ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ===

    formatDate(dateString) {
        if (!dateString) return '';
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
            <button onclick="this.parentElement.remove()" 
                    style="margin-left: auto; background: none; border: none; cursor: pointer;">×</button>
        `;
        
        const container = document.querySelector('main');
        if (container) {
            container.insertBefore(alertDiv, container.firstChild);
            setTimeout(() => alertDiv.remove(), 5000);
        }
    }

    setupEventListeners() {
        // Кнопки создания
        const createButtons = {
            'createLocationBtn': () => this.createLocation(),
            'createGroupBtn': () => this.createGroup(),
            'createRoleBtn': () => this.createRole(),
            'createPositionBtn': () => this.createPosition(),
            'createSupervisorBtn': () => this.createSupervisor()
        };

        Object.entries(createButtons).forEach(([id, handler]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', handler);
            }
        });
    }
}

const adminCRUD = new AdminCRUD();