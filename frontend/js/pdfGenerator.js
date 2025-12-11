// Простой PDF экспортер - только таблицы
class SimplePDFExporter {
    constructor() {
        this.jsPDF = window.jspdf;
    }

    // Основная функция экспорта
    exportTableToPDF(data, title = 'Отчет') {
        if (!this.jsPDF) {
            alert('Библиотека jsPDF не загружена');
            return false;
        }

        try {
            const { jsPDF } = this.jsPDF;
            const doc = new jsPDF('p', 'mm', 'a4');
            
            // Устанавливаем шрифт по умолчанию
            doc.setFont('helvetica');
            
            // Заголовок отчета
            doc.setFontSize(16);
            doc.text(title, 105, 15, { align: 'center' });
            
            // Информация о генерации
            doc.setFontSize(10);
            doc.text(`Сгенерировано: ${new Date().toLocaleString('ru-RU')}`, 105, 22, { align: 'center' });
            
            let yPos = 30;
            
            if (Array.isArray(data) && data.length > 0) {
                // Определяем заголовки таблицы
                const headers = Object.keys(data[0]);
                
                // Рассчитываем ширину колонок
                const pageWidth = 190;
                const colCount = headers.length;
                const colWidth = pageWidth / Math.min(colCount, 4); // Максимум 4 колонки для читаемости
                
                // Ограничиваем количество колонок для PDF
                const displayHeaders = headers.slice(0, 4);
                const displayData = data.map(row => {
                    const newRow = {};
                    displayHeaders.forEach(header => {
                        newRow[header] = this.formatCellValue(row[header]);
                    });
                    return newRow;
                });
                
                // Заголовки таблицы
                doc.setFillColor(240, 240, 240);
                doc.rect(10, yPos, colWidth * displayHeaders.length, 8, 'F');
                
                doc.setFontSize(11);
                doc.setTextColor(0, 0, 0);
                
                displayHeaders.forEach((header, index) => {
                    const xPos = 10 + (index * colWidth) + (colWidth / 2);
                    doc.text(header.toString(), xPos, yPos + 5, { align: 'center' });
                });
                
                yPos += 8;
                
                // Данные таблицы
                doc.setFontSize(10);
                
                displayData.forEach((row, rowIndex) => {
                    // Проверяем, нужно ли добавлять новую страницу
                    if (yPos > 270) {
                        doc.addPage();
                        yPos = 20;
                    }
                    
                    displayHeaders.forEach((header, colIndex) => {
                        const xPos = 10 + (colIndex * colWidth) + 2;
                        doc.text(row[header].toString(), xPos, yPos + 5);
                    });
                    
                    yPos += 8;
                });
                
                // Итоговая информация
                yPos += 10;
                doc.setFontSize(12);
                doc.text(`Всего записей: ${data.length}`, 10, yPos);
                
            } else if (typeof data === 'object' && data !== null) {
                // Если передан одиночный объект
                Object.entries(data).forEach(([key, value], index) => {
                    if (yPos > 270) {
                        doc.addPage();
                        yPos = 20;
                    }
                    
                    doc.setFontSize(11);
                    doc.text(`${key}: ${this.formatCellValue(value)}`, 10, yPos);
                    yPos += 10;
                });
            } else {
                doc.text('Нет данных для экспорта', 10, yPos);
            }
            
            // Сохраняем файл
            const fileName = `report_${Date.now()}.pdf`;
            doc.save(fileName);
            
            return true;
            
        } catch (error) {
            console.error('Ошибка экспорта в PDF:', error);
            alert('Ошибка при экспорте в PDF: ' + error.message);
            return false;
        }
    }
    
    // Форматирование значения ячейки
    formatCellValue(value) {
        if (value === null || value === undefined) {
            return '';
        }
        
        if (typeof value === 'boolean') {
            return value ? 'Да' : 'Нет';
        }
        
        if (value instanceof Date) {
            return value.toLocaleDateString('ru-RU');
        }
        
        // Обработка строк для избежания проблем с кодировкой
        const strValue = value.toString();
        
        // Простая транслитерация кириллицы для избежания проблем
        const cyrillicToLatin = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
            'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i',
            'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
            'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
            'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch',
            'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '',
            'э': 'e', 'ю': 'yu', 'я': 'ya',
            'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D',
            'Е': 'E', 'Ё': 'E', 'Ж': 'Zh', 'З': 'Z', 'И': 'I',
            'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N',
            'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T',
            'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch',
            'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '', 'Ы': 'Y', 'Ь': '',
            'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
        };
        
        // Заменяем кириллические символы
        let result = '';
        for (let i = 0; i < strValue.length; i++) {
            const char = strValue[i];
            result += cyrillicToLatin[char] || char;
        }
        
        // Ограничиваем длину текста
        const maxLength = 50;
        if (result.length > maxLength) {
            return result.substring(0, maxLength - 3) + '...';
        }
        
        return result;
    }
    
    // Простая функция для обратной совместимости
    static exportPDF(data, title) {
        const exporter = new SimplePDFExporter();
        return exporter.exportTableToPDF(data, title);
    }
}

// Глобальный экспорт для обратной совместимости
window.generateStyledPDF = function(data, title) {
    const exporter = new SimplePDFExporter();
    return exporter.exportTableToPDF(data, title);
};

window.generatePDF = function(data, title) {
    const exporter = new SimplePDFExporter();
    return exporter.exportTableToPDF(data, title);
};

window.SimplePDFExporter = SimplePDFExporter;