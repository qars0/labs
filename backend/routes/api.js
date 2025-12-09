const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const queryController = require('../controllers/queryController');
const mainController = require('../controllers/mainController');

// === АВТОРИЗАЦИЯ ===
router.post('/auth/login', authController.login);
router.post('/auth/check', authController.checkAuth);

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