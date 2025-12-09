class AuthManager {
    constructor() {
        this.api = api;
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Проверяем сохраненного пользователя в localStorage
        const savedUser = localStorage.getItem('practice_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.updateUI();
            } catch (e) {
                console.error('Ошибка при загрузке пользователя:', e);
                this.clearAuth();
            }
        }
    }

    async login(username, password) {
        try {
            const result = await this.api.login(username, password);
            if (result.success) {
                this.currentUser = result.user;
                localStorage.setItem('practice_user', JSON.stringify(result.user));
                this.updateUI();
                return { success: true, user: result.user };
            }
            return { success: false, error: result.error };
        } catch (error) {
            console.error('Ошибка входа:', error);
            return { success: false, error: 'Ошибка соединения с сервером' };
        }
    }

    logout() {
        this.clearAuth();
        window.location.href = 'login.html';
    }

    clearAuth() {
        this.currentUser = null;
        localStorage.removeItem('practice_user');
        this.updateUI();
    }

    updateUI() {
        const user = this.currentUser;
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const userInfo = document.getElementById('userInfo');
        const adminNav = document.getElementById('adminNav');

        if (user) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline-flex';
            
            if (userInfo) {
                userInfo.innerHTML = `
                    <div class="user-avatar">
                        ${user.fullName.charAt(0)}
                    </div>
                    <div>
                        <strong>${user.fullName}</strong>
                        <br>
                        <small>${user.isAdmin ? 'Администратор' : 'Студент'}</small>
                    </div>
                `;
            }

            if (adminNav) {
                adminNav.style.display = user.isAdmin ? 'inline-flex' : 'none';
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'inline-flex';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userInfo) userInfo.innerHTML = '';
            if (adminNav) adminNav.style.display = 'none';
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    isAdmin() {
        return this.currentUser && this.currentUser.isAdmin;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    requireAuth(redirectTo = 'login.html') {
        if (!this.isAuthenticated()) {
            window.location.href = redirectTo;
            return false;
        }
        return true;
    }

    requireAdmin(redirectTo = 'student.html') {
        if (!this.isAuthenticated() || !this.isAdmin()) {
            window.location.href = redirectTo;
            return false;
        }
        return true;
    }
}

const auth = new AuthManager();