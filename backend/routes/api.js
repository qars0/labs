const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const queryController = require('../controllers/queryController');
const mainController = require('../controllers/mainController');
const adminController = require('../controllers/adminController');

// === АВТОРИЗАЦИЯ ===
router.post('/auth/login', authController.login);
router.post('/auth/check', authController.checkAuth);

// === CRUD ДЛЯ 5 ТАБЛИЦ (АДМИНИСТРАТОР) ===

// Practice Locations
router.get('/admin/locations', adminController.getLocations);
router.post('/admin/locations', adminController.createLocation);
router.put('/admin/locations/:id', adminController.updateLocation);
router.delete('/admin/locations/:id', adminController.deleteLocation);

// Student Groups
router.get('/admin/groups', adminController.getGroups);
router.post('/admin/groups', adminController.createGroup);
router.put('/admin/groups/:id', adminController.updateGroup);
router.delete('/admin/groups/:id', adminController.deleteGroup);

// Roles
router.get('/admin/roles', adminController.getRoles);
router.post('/admin/roles', adminController.createRole);
router.put('/admin/roles/:id', adminController.updateRole);
router.delete('/admin/roles/:id', adminController.deleteRole);

// User Positions
router.get('/admin/positions', adminController.getPositions);
router.post('/admin/positions', adminController.createPosition);
router.put('/admin/positions/:id', adminController.updatePosition);
router.delete('/admin/positions/:id', adminController.deletePosition);

// Supervisors
router.get('/admin/supervisors', adminController.getSupervisors);
router.post('/admin/supervisors', adminController.createSupervisor);
router.put('/admin/supervisors/:id', adminController.updateSupervisor);
router.delete('/admin/supervisors/:id', adminController.deleteSupervisor);

// Вспомогательные методы
router.get('/admin/organizations', adminController.getOrganizations);
router.get('/admin/practices', adminController.getPractices);

// === СТУДЕНЧЕСКИЕ ФУНКЦИИ ===

// Профиль
router.post('/student/profile', mainController.getStudentProfile);

// Дневник практики (Work Diary) - CRUD
router.post('/student/diary', mainController.getStudentDiary);
router.post('/student/diary/add', mainController.addDiaryEntry);
router.get('/student/diary/:id', mainController.getDiaryEntry);
router.put('/student/diary/:id', mainController.updateDiaryEntry);
router.delete('/student/diary/:id', mainController.deleteDiaryEntry);

// Индивидуальные задания (Individual Work) - CRUD
router.post('/student/individual-works', mainController.getIndividualWorks);
router.post('/student/individual-works/add', mainController.addIndividualWork);
router.get('/student/individual-works/:id', mainController.getIndividualWork);
router.put('/student/individual-works/:id', mainController.updateIndividualWork);
router.delete('/student/individual-works/:id', mainController.deleteIndividualWork);

// === СТАТИЧЕСКИЕ ЗАПРОСЫ (10 штук) ===
router.get('/queries/users', queryController.getAllUsers);
router.get('/queries/practices', queryController.getAllPractices);
router.get('/queries/students-groups', queryController.getAllStudentsWithGroups);
router.get('/queries/diary', queryController.getAllDiaryEntries);
router.get('/queries/admins', queryController.getAdminUsers);
router.get('/queries/students-recent-diary', queryController.getStudentsWithRecentDiary);
router.get('/queries/students-practice-location', queryController.getStudentsWithPracticeLocation);
router.get('/queries/supervisors-details', queryController.getSupervisorsWithDetails);

// Создание представлений
router.post('/queries/create-views', queryController.createStudentGroupsView);
router.post('/queries/create-practice-view', queryController.createPracticeStudentsView);

// Запросы к представлениям
router.get('/queries/student-groups-view', queryController.getStudentGroupsView);
router.get('/queries/practice-students-view', queryController.getPracticeStudentsView);

// === ДИНАМИЧЕСКИЙ ЗАПРОС ===
router.post('/queries/dynamic', queryController.executeDynamicQuery);

// === ФУНКЦИИ (2) ===
router.get('/functions/students-count/:practice_id', queryController.getStudentsCountOnPractice);
router.get('/functions/avg-diary-entries', queryController.getAvgDiaryEntries);

// === ПРОЦЕДУРЫ (2) ===
router.post('/procedures/add-student', queryController.addStudentProcedure);
router.post('/procedures/close-practice', queryController.closePracticeProcedure);

// === ТРАНЗАКЦИИ (2) ===
router.post('/transactions/move-student', queryController.moveStudentTransaction);
router.post('/transactions/delete-student', queryController.deleteStudentTransaction);

module.exports = router;