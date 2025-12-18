// Простой PDF экспортер с использованием autoTable
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
            
            // Добавляем заголовок
            doc.setFontSize(16);
            doc.text(title, 14, 22);
            
            // Добавляем дату генерации
            doc.setFontSize(10);
            doc.text(`Generated at: ${new Date().toLocaleString('ru-RU')}`, 14, 30);
            
            if (Array.isArray(data) && data.length > 0) {
                // Подготавливаем данные для таблицы
                const headers = Object.keys(data[0]);
                const body = data.map(row => {
                    return headers.map(header => {
                        const value = row[header];
                        return this.formatCellValue(value);
                    });
                });
                
                // Преобразуем заголовки в читаемый вид
                const displayHeaders = headers.map(header => 
                    this.formatHeader(header)
                );
                
                // Создаем таблицу с помощью autoTable
                doc.autoTable({
                    head: [displayHeaders],
                    body: body,
                    startY: 40,
                    theme: 'grid',
                    styles: {
                        fontSize: 9,
                        cellPadding: 3,
                        overflow: 'linebreak',
                        halign: 'left',
                        valign: 'middle'
                    },
                    headStyles: {
                        fillColor: [66, 139, 202],
                        textColor: 255,
                        fontStyle: 'bold'
                    },
                    columnStyles: {},
                    didDrawPage: function (data) {
                        // Добавляем номер страницы
                        const pageCount = doc.internal.getNumberOfPages();
                        doc.setFontSize(10);
                        doc.text(
                            `Page ${data.pageNumber} of ${pageCount}`,
                            doc.internal.pageSize.width / 2,
                            doc.internal.pageSize.height - 10,
                            { align: 'center' }
                        );
                    }
                });
                
            } else if (typeof data === 'object' && data !== null) {
                // Если передан одиночный объект
                const startY = 40;
                let currentY = startY;
                
                Object.entries(data).forEach(([key, value]) => {
                    if (currentY > 280) {
                        doc.addPage();
                        currentY = 20;
                    }
                    
                    doc.setFontSize(11);
                    const text = `${this.formatHeader(key)}: ${this.formatCellValue(value)}`;
                    const lines = doc.splitTextToSize(text, 180);
                    
                    doc.text(lines, 14, currentY);
                    currentY += (lines.length * 7) + 5;
                });
            } else {
                doc.text('Нет данных для экспорта', 14, 40);
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
    
    // Форматирование заголовка
    formatHeader(header) {
        if (!header) return '';
        
        // Преобразуем snake_case или camelCase в читаемый текст
        const str = header.toString();
        let result = str
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, char => char.toUpperCase())
            .trim();
        
        return this.transliterate(result);
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
        
        // Преобразуем в строку
        const strValue = value.toString().trim();
        
        // Ограничиваем длину текста для таблицы
        if (strValue.length > 50) {
            return this.transliterate(strValue.substring(0, 47) + '...');
        }
        
        return this.transliterate(strValue);
    }
    
    // Простая транслитерация кириллицы
    transliterate(text) {
        if (!text) return '';
        
        const cyrillicToLatin = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
            'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i',
            'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
            'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
            'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch',
            'ш': 'sh', 'щ': 'sch', 'ъ': '``', 'ы': 'y', 'ь': '`',
            'э': 'e', 'ю': 'yu', 'я': 'ya',
            'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D',
            'Е': 'E', 'Ё': 'E', 'Ж': 'Zh', 'З': 'Z', 'И': 'I',
            'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N',
            'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T',
            'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch',
            'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '``', 'Ы': 'Y', 'Ь': '`',
            'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
        };
        
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            result += cyrillicToLatin[char] || char;
        }
        
        return result;
    }
}

// Глобальный экспорт
//window.generateStyledPDF = function(data, title) {
//    const exporter = new SimplePDFExporter();
//    return exporter.exportTableToPDF(data, title);
//};

window.generatePDF = function(data, title) {
    const exporter = new SimplePDFExporter();
    return exporter.exportTableToPDF(data, title);
};