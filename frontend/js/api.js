class API {
    constructor() {
        this.baseURL = '/api';
    }

    async request(endpoint, method = 'GET', data = null) {
        const url = `${this.baseURL}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || `Ошибка ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth
    async login(username, password) {
        return this.request('/auth/login', 'POST', { username, password });
    }

    async checkAuth(userId) {
        return this.request('/auth/check', 'POST', { userId });
    }

    // Student Profile
    async getStudentProfile(userId) {
        return this.request('/student/profile', 'POST', { user_id: userId });
    }

    // Work Diary - CRUD
    async getStudentDiary(userId) {
        return this.request('/student/diary', 'POST', { user_id: userId });
    }

    async getDiaryEntry(entryId, userId) {
        return this.request(`/student/diary/${entryId}`, 'POST', { user_id: userId });
    }

    async addDiaryEntry(userId, work_date, description) {
        return this.request('/student/diary/add', 'POST', { 
            user_id: userId, 
            work_date, 
            description 
        });
    }

    async updateDiaryEntry(entryId, userId, work_date, description) {
        return this.request(`/student/diary/${entryId}`, 'PUT', { 
            user_id: userId,
            work_date,
            description
        });
    }

    async deleteDiaryEntry(entryId, userId) {
        return this.request(`/student/diary/${entryId}`, 'DELETE', { 
            user_id: userId 
        });
    }

    // Individual Work - CRUD
    async getIndividualWorks(userId) {
        return this.request('/student/individual-works', 'POST', { user_id: userId });
    }

    async getIndividualWork(workId, userId) {
        return this.request(`/student/individual-works/${workId}`, 'POST', { user_id: userId });
    }

    async addIndividualWork(userId, issue_date, work_description, issue_deadline, complete_mark = false) {
        return this.request('/student/individual-works/add', 'POST', { 
            user_id: userId,
            issue_date,
            work_description,
            issue_deadline,
            complete_mark
        });
    }

    async updateIndividualWork(workId, userId, data) {
        return this.request(`/student/individual-works/${workId}`, 'PUT', {
            user_id: userId,
            ...data
        });
    }

    async deleteIndividualWork(workId, userId) {
        return this.request(`/student/individual-works/${workId}`, 'DELETE', { 
            user_id: userId 
        });
    }

    // Admin queries (static)
    async getAllUsers() {
        return this.request('/queries/users');
    }

    async getAllPractices() {
        return this.request('/queries/practices');
    }

    async getAllStudentsWithGroups() {
        return this.request('/queries/students-groups');
    }

    async getAllDiaryEntries() {
        return this.request('/queries/diary');
    }

    async getAdminUsers() {
        return this.request('/queries/admins');
    }

    async getStudentsWithRecentDiary() {
        return this.request('/queries/students-recent-diary');
    }

    async getStudentsWithPracticeLocation() {
        return this.request('/queries/students-practice-location');
    }

    async getSupervisorsWithDetails() {
        return this.request('/queries/supervisors-details');
    }

    async createViews() {
        return this.request('/queries/create-views', 'POST');
    }

    async getStudentGroupsView() {
        return this.request('/queries/student-groups-view');
    }

    async getPracticeStudentsView() {
        return this.request('/queries/practice-students-view');
    }

    // Dynamic query
    async executeDynamicQuery(query) {
        return this.request('/queries/dynamic', 'POST', { query });
    }

    // Functions
    async getStudentsCountOnPractice(practiceId) {
        return this.request(`/functions/students-count/${practiceId}`);
    }

    async getAvgDiaryEntries() {
        return this.request('/functions/avg-diary-entries');
    }

    // Procedures
    async addStudentProcedure(data) {
        return this.request('/procedures/add-student', 'POST', data);
    }

    async closePracticeProcedure(data) {
        return this.request('/procedures/close-practice', 'POST', data);
    }

    // Transactions
    async moveStudentTransaction(data) {
        return this.request('/transactions/move-student', 'POST', data);
    }

    async deleteStudentTransaction(data) {
        return this.request('/transactions/delete-student', 'POST', data);
    }
}

const api = new API();