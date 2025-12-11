// ========== ОБЩИЕ ФУНКЦИИ ==========

// Функция для добавления кириллического шрифта
function addCyrillicFont(doc) {
    try {
        // Подключаем стандартный шрифт с поддержкой кириллицы
        doc.setFont("helvetica");
        // Для лучшей поддержки кириллицы в jsPDF
        doc.setLanguage("ru-RU");
    } catch (error) {
        console.error('Ошибка установки шрифта:', error);
    }
}

// Функция для безопасного вывода текста
function safeText(text) {
    if (!text) return '';
    return text.toString();
}

// ========== PDF ДЛЯ СТУДЕНТА ==========

// Экспорт дневника практики в PDF
function exportDiaryToPDF(diaryData, studentInfo) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        addCyrillicFont(doc);
        
        // Заголовок
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text('Дневник практики студента', 105, 20, { align: 'center' });
        
        // Информация о студенте
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Студент: ${safeText(studentInfo.fullName) || 'Не указано'}`, 20, 35);
        doc.text(`Группа: ${safeText(studentInfo.group) || 'Не указана'}`, 20, 42);
        doc.text(`Период практики: ${safeText(studentInfo.practicePeriod) || 'Не указан'}`, 20, 49);
        doc.text(`Дата генерации: ${new Date().toLocaleDateString('ru-RU')}`, 20, 56);
        
        let yPosition = 70;
        
        if (diaryData && diaryData.length > 0) {
            // Таблица с записями
            const pageWidth = 170;
            const colWidths = [30, 90, 50]; // Ширина столбцов
            
            // Заголовки таблицы
            doc.setFillColor(220, 220, 220);
            doc.rect(20, yPosition, pageWidth, 8, 'F');
            doc.setTextColor(40, 40, 40);
            doc.setFontSize(10);
            
            doc.text('Дата', 20 + colWidths[0]/2, yPosition + 5, { align: 'center' });
            doc.text('Описание работы', 20 + colWidths[0] + colWidths[1]/2, yPosition + 5, { align: 'center' });
            doc.text('Дата записи', 20 + colWidths[0] + colWidths[1] + colWidths[2]/2, yPosition + 5, { align: 'center' });
            
            yPosition += 8;
            
            // Данные таблицы
            diaryData.forEach((entry, index) => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }
                
                // Дата работы
                doc.setTextColor(60, 60, 60);
                doc.setFontSize(9);
                doc.text(
                    formatDate(entry.work_date),
                    20 + colWidths[0]/2,
                    yPosition + 5,
                    { align: 'center' }
                );
                
                // Описание работы (обрезаем длинный текст)
                const description = entry.description || '';
                const maxLength = 60;
                let displayDescription = description.length > maxLength 
                    ? description.substring(0, maxLength - 3) + '...' 
                    : description;
                
                doc.text(
                    safeText(displayDescription),
                    20 + colWidths[0] + 2,
                    yPosition + 5
                );
                
                // Дата создания
                doc.text(
                    formatDate(entry.created_at),
                    20 + colWidths[0] + colWidths[1] + colWidths[2]/2,
                    yPosition + 5,
                    { align: 'center' }
                );
                
                yPosition += 8;
                
                // Разделительная линия
                if (index < diaryData.length - 1) {
                    doc.setDrawColor(200, 200, 200);
                    doc.line(20, yPosition - 1, 190, yPosition - 1);
                }
            });
            
            // Итоги
            yPosition += 15;
            doc.setFontSize(12);
            doc.setTextColor(102, 126, 234);
            doc.text(`Всего записей: ${diaryData.length}`, 20, yPosition);
            
        } else {
            doc.text('Нет записей в дневнике', 20, yPosition);
        }
        
        // Подпись
        yPosition = 280;
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('Сгенерировано системой управления практиками ОмГТУ', 105, yPosition, { align: 'center' });
        
        // Сохраняем PDF
        const fileName = `diary_${(studentInfo.fullName || 'student').replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}_${Date.now()}.pdf`;
        doc.save(fileName);
        
        return true;
    } catch (error) {
        console.error('Ошибка генерации PDF дневника:', error);
        alert('Ошибка при генерации PDF: ' + error.message);
        return false;
    }
}

// Экспорт индивидуальных заданий в PDF
function exportWorksToPDF(worksData, studentInfo) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        addCyrillicFont(doc);
        
        // Заголовок
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text('Индивидуальные задания студента', 105, 20, { align: 'center' });
        
        // Информация о студенте
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Студент: ${safeText(studentInfo.fullName) || 'Не указано'}`, 20, 35);
        doc.text(`Группа: ${safeText(studentInfo.group) || 'Не указана'}`, 20, 42);
        doc.text(`Дата генерации: ${new Date().toLocaleDateString('ru-RU')}`, 20, 49);
        
        let yPosition = 60;
        
        if (worksData && worksData.length > 0) {
            // Таблица с заданиями
            const pageWidth = 170;
            const colWidths = [25, 60, 25, 20, 40]; // Ширина столбцов
            
            // Заголовки таблицы
            doc.setFillColor(220, 220, 220);
            doc.rect(20, yPosition, pageWidth, 8, 'F');
            doc.setTextColor(40, 40, 40);
            doc.setFontSize(9);
            
            doc.text('Выдача', 20 + colWidths[0]/2, yPosition + 5, { align: 'center' });
            doc.text('Описание', 20 + colWidths[0] + colWidths[1]/2, yPosition + 5, { align: 'center' });
            doc.text('Срок', 20 + colWidths[0] + colWidths[1] + colWidths[2]/2, yPosition + 5, { align: 'center' });
            doc.text('Выпол.', 20 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]/2, yPosition + 5, { align: 'center' });
            doc.text('Создано', 20 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4]/2, yPosition + 5, { align: 'center' });
            
            yPosition += 8;
            
            // Данные таблицы
            worksData.forEach((work, index) => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }
                
                // Дата выдачи
                doc.setTextColor(60, 60, 60);
                doc.setFontSize(8);
                doc.text(
                    formatDate(work.issue_date),
                    20 + colWidths[0]/2,
                    yPosition + 5,
                    { align: 'center' }
                );
                
                // Описание задания (обрезаем длинный текст)
                const description = work.work_description || '';
                const maxLength = 40;
                let displayDescription = description.length > maxLength 
                    ? description.substring(0, maxLength - 3) + '...' 
                    : description;
                
                doc.text(
                    safeText(displayDescription),
                    20 + colWidths[0] + 2,
                    yPosition + 5
                );
                
                // Срок выполнения
                doc.text(
                    formatDate(work.issue_deadline),
                    20 + colWidths[0] + colWidths[1] + colWidths[2]/2,
                    yPosition + 5,
                    { align: 'center' }
                );
                
                // Выполнено
                doc.text(
                    work.complete_mark ? 'Да' : 'Нет',
                    20 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]/2,
                    yPosition + 5,
                    { align: 'center' }
                );
                
                // Дата создания
                doc.text(
                    formatDate(work.created_at),
                    20 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4]/2,
                    yPosition + 5,
                    { align: 'center' }
                );
                
                yPosition += 8;
                
                // Разделительная линия
                if (index < worksData.length - 1) {
                    doc.setDrawColor(200, 200, 200);
                    doc.line(20, yPosition - 1, 190, yPosition - 1);
                }
            });
            
            // Статистика
            const completed = worksData.filter(w => w.complete_mark).length;
            yPosition += 15;
            doc.setFontSize(12);
            doc.setTextColor(102, 126, 234);
            doc.text(`Всего заданий: ${worksData.length}`, 20, yPosition);
            doc.text(`Выполнено: ${completed} (${Math.round((completed/worksData.length)*100)}%)`, 20, yPosition + 8);
            
        } else {
            doc.text('Нет индивидуальных заданий', 20, yPosition);
        }
        
        // Подпись
        yPosition = 280;
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('Сгенерировано системой управления практиками ОмГТУ', 105, yPosition, { align: 'center' });
        
        // Сохраняем PDF
        const fileName = `works_${(studentInfo.fullName || 'student').replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}_${Date.now()}.pdf`;
        doc.save(fileName);
        
        return true;
    } catch (error) {
        console.error('Ошибка генерации PDF заданий:', error);
        alert('Ошибка при генерации PDF: ' + error.message);
        return false;
    }
}

// ========== PDF ДЛЯ АДМИНИСТРАТОРА ==========

// Обновленная функция для администратора
function generateStyledPDF(data, title = 'Отчет системы практик') {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        addCyrillicFont(doc);
        
        // Логотип и заголовок
        doc.setFillColor(102, 126, 234);
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text('ОмГТУ', 105, 20, { align: 'center' });
        
        doc.setFontSize(16);
        doc.text('Система управления практиками', 105, 30, { align: 'center' });
        
        // Заголовок отчета
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(18);
        doc.text(safeText(title), 20, 60);
        
        // Информация о генерации
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Дата генерации: ${new Date().toLocaleDateString('ru-RU')}`, 20, 70);
        doc.text(`Время генерации: ${new Date().toLocaleTimeString('ru-RU')}`, 20, 76);
        
        let yPosition = 90;
        
        if (Array.isArray(data) && data.length > 0) {
            // Определяем доступные колонки
            const sampleRow = data[0];
            const headers = Object.keys(sampleRow);
            const maxColumns = 4;
            const visibleHeaders = headers.slice(0, Math.min(headers.length, maxColumns));
            
            const pageWidth = 170;
            const colWidth = pageWidth / visibleHeaders.length;
            
            // Заголовки таблицы
            visibleHeaders.forEach((header, index) => {
                doc.setFillColor(220, 220, 220);
                doc.rect(20 + (index * colWidth), yPosition, colWidth, 8, 'F');
                doc.setTextColor(40, 40, 40);
                doc.setFontSize(10);
                
                doc.text(
                    safeText(header),
                    20 + (index * colWidth) + (colWidth / 2),
                    yPosition + 5,
                    { align: 'center' }
                );
            });
            
            yPosition += 8;
            
            // Данные таблицы
            data.forEach((row, rowIndex) => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }
                
                visibleHeaders.forEach((header, colIndex) => {
                    let cellValue = row[header];
                    if (cellValue === null || cellValue === undefined) {
                        cellValue = '';
                    }
                    
                    const cellString = cellValue.toString();
                    const maxLength = 25;
                    let displayValue = cellString.length > maxLength 
                        ? cellString.substring(0, maxLength - 3) + '...' 
                        : cellString;
                    
                    doc.setTextColor(60, 60, 60);
                    doc.setFontSize(9);
                    doc.text(
                        safeText(displayValue),
                        20 + (colIndex * colWidth) + 2,
                        yPosition + 5
                    );
                });
                
                yPosition += 8;
                
                // Разделительная линия
                if (rowIndex < data.length - 1) {
                    doc.setDrawColor(200, 200, 200);
                    doc.line(20, yPosition - 1, 190, yPosition - 1);
                }
            });
            
            // Итоги
            yPosition += 15;
            doc.setFontSize(12);
            doc.setTextColor(102, 126, 234);
            doc.text(`Всего записей: ${data.length}`, 20, yPosition);
            
        } else if (typeof data === 'object' && data !== null) {
            // Для одиночного объекта
            Object.entries(data).forEach(([key, value], index) => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }
                
                doc.text(`${safeText(key)}: ${safeText(value)}`, 20, yPosition);
                yPosition += 10;
            });
        } else {
            doc.text('Нет данных для отображения', 20, yPosition);
        }
        
        // Подпись
        yPosition = 280;
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('Сгенерировано системой управления практиками ОмГТУ', 105, yPosition, { align: 'center' });
        
        // Сохраняем PDF
        const fileName = `report_${Date.now()}.pdf`;
        doc.save(fileName);
        
        return true;
    } catch (error) {
        console.error('Ошибка генерации PDF:', error);
        alert('Ошибка при генерации PDF: ' + error.message);
        return false;
    }
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

function formatDate(dateString) {
    if (!dateString) return '—';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    } catch (e) {
        return dateString;
    }
}

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '—';
    try {
        const date = new Date(dateTimeString);
        return date.toLocaleString('ru-RU');
    } catch (e) {
        return dateTimeString;
    }
}

// Универсальная функция генерации PDF (для обратной совместимости)
function generatePDF(data, title = 'Отчет') {
    return generateStyledPDF(data, title);
}

// Экспорт функций
window.exportDiaryToPDF = exportDiaryToPDF;
window.exportWorksToPDF = exportWorksToPDF;
window.generateStyledPDF = generateStyledPDF;
window.generatePDF = generatePDF;