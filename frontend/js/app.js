document.addEventListener('DOMContentLoaded', async () => {
    // Проверяем подключение к бэкенду
    try {
        const statusElement = document.getElementById('status');
        const data = await api.getTestData();
        
        statusElement.innerHTML = `
            <p style="color: green;">✅ ${data.message}</p>
            <p>Database time: ${new Date(data.timestamp).toLocaleString()}</p>
        `;
    } catch (error) {
        document.getElementById('status').innerHTML = 
            `<p style="color: red;">❌ Error connecting to backend: ${error.message}</p>`;
    }
});

async function loadItems() {
    try {
        const items = await api.getItems();
        const listElement = document.getElementById('items-list');
        
        listElement.innerHTML = items.map(item => 
            `<li>${item.name} (ID: ${item.id})</li>`
        ).join('');
    } catch (error) {
        alert('Error loading items: ' + error.message);
    }
}