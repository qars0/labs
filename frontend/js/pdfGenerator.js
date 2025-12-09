// Подключите библиотеку jsPDF в index.html:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

function generatePDF(data, title = 'Отчет') {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Заголовок
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text(title, 105, 20, { align: 'center' });
        
        // Информация о генерации
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Сгенерировано: ${new Date().toLocaleString('ru-RU')}`, 105, 30, { align: 'center' });
        
        let yPosition = 40;
        
        if (Array.isArray(data) && data.length > 0) {
            // Определяем столбцы
            const headers = Object.keys(data[0]);
            
            // Рассчитываем ширину столбцов
            const pageWidth = 190;
            const colWidth = pageWidth / headers.length;
            
            // Заголовки таблицы
            doc.setFillColor(100, 100, 200);
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(11);
            
            headers.forEach((header, index) => {
                doc.rect(10 + (index * colWidth), yPosition, colWidth, 8, 'F');
                doc.text(
                    header.toString(),
                    10 + (index * colWidth) + (colWidth / 2),
                    yPosition + 5,
                    { align: 'center' }
                );
            });
            
            yPosition += 8;
            
            // Данные
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            
            data.forEach((row, rowIndex) => {
                // Проверка на новую страницу
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }
                
                headers.forEach((header, colIndex) => {
                    const cellValue = row[header]?.toString() || '';
                    
                    // Обрезаем длинный текст
                    const maxLength = 30;
                    const displayValue = cellValue.length > maxLength 
                        ? cellValue.substring(0, maxLength - 3) + '...' 
                        : cellValue;
                    
                    doc.text(
                        displayValue,
                        10 + (colIndex * colWidth) + 2,
                        yPosition + 5
                    );
                });
                
                yPosition += 8;
            });
            
            // Итоговая информация
            yPosition += 10;
            doc.setFontSize(12);
            doc.text(`Всего записей: ${data.length}`, 105, yPosition, { align: 'center' });
            
        } else if (typeof data === 'object') {
            // Для одиночных объектов
            doc.setFontSize(12);
            Object.entries(data).forEach(([key, value], index) => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }
                
                doc.text(`${key}: ${JSON.stringify(value)}`, 20, yPosition);
                yPosition += 10;
            });
        } else {
            doc.text('Нет данных для отображения', 20, yPosition);
        }
        
        // Сохраняем PDF
        doc.save(`${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
        
        return true;
    } catch (error) {
        console.error('Ошибка генерации PDF:', error);
        alert('Ошибка при генерации PDF: ' + error.message);
        return false;
    }
}

// Альтернативная функция с более красивым дизайном
function generateStyledPDF(data, title = 'Отчет системы практик') {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
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
        doc.text(title, 20, 60);
        
        // Информация о генерации
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Дата генерации: ${new Date().toLocaleDateString('ru-RU')}`, 20, 70);
        doc.text(`Время генерации: ${new Date().toLocaleTimeString('ru-RU')}`, 20, 76);
        
        let yPosition = 90;
        
        if (Array.isArray(data) && data.length > 0) {
            // Таблица с данными
            const headers = Object.keys(data[0]);
            const pageWidth = 170;
            const colWidth = pageWidth / Math.min(headers.length, 4);
            
            // Заголовки таблицы
            headers.forEach((header, index) => {
                if (index >= 4) return; // Ограничиваем 4 столбцами для читаемости
                
                doc.setFillColor(220, 220, 220);
                doc.rect(20 + (index * colWidth), yPosition, colWidth, 8, 'F');
                doc.setTextColor(40, 40, 40);
                doc.setFontSize(10);
                doc.text(
                    header.toString(),
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
                
                headers.forEach((header, colIndex) => {
                    if (colIndex >= 4) return;
                    
                    const cellValue = row[header]?.toString() || '';
                    const maxLength = 25;
                    const displayValue = cellValue.length > maxLength 
                        ? cellValue.substring(0, maxLength - 3) + '...' 
                        : cellValue;
                    
                    doc.setTextColor(60, 60, 60);
                    doc.setFontSize(9);
                    doc.text(
                        displayValue,
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
            doc.text(`Итого записей: ${data.length}`, 20, yPosition);
            
        } else {
            doc.text('Нет данных для отображения', 20, yPosition);
        }
        
        // Подпись
        yPosition = 280;
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('Сгенерировано системой управления практиками ОмГТУ', 105, yPosition, { align: 'center' });
        
        // Сохраняем PDF
        doc.save(`Отчет_${title}_${Date.now()}.pdf`);
        
        return true;
    } catch (error) {
        console.error('Ошибка генерации PDF:', error);
        alert('Ошибка при генерации PDF: ' + error.message);
        return false;
    }
}