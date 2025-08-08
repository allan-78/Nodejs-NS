const token = localStorage.getItem('token');
     const getRole = localStorage.getItem('role');

    if (!token || !getRole ){
        location.href="../../status_pages/401.html"
    }else{
          if (getRole !== 'admin') {
        location.href = '../../status_pages/403.html';
    }
    };

     
  

// Fetch and render admin dashboard charts from backend
document.addEventListener('DOMContentLoaded', function () {
    
    // Helper: fetch chart data (absolute path for dev)
    function fetchChart(url) {
        // Try relative, fallback to absolute if needed
        let apiUrl = url;
        if (!url.startsWith('http')) {
            // Try to guess backend port (default 3000)
            const base = window.location.origin.includes('3000') ? window.location.origin : window.location.origin.replace(/:\\d+$/, ':3000');
            apiUrl = base + url;
        }
        return fetch(apiUrl, {
            headers: { 'Authorization': 'Bearer ' + token }
        }).then(r => r.json());
    }

    // Sales Bar Chart
    fetchChart('/api/v1/sales-chart').then(data => {
        if (!data.rows || !Array.isArray(data.rows) || !document.getElementById('barChart')) return;
        const labels = data.rows.map(r => r.month || r.label || '');
        const values = data.rows.map(r => parseFloat(r.total || r.sales || 0));
        new Chart(document.getElementById('barChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels,
                datasets: [{ label: 'Sales', data: values, backgroundColor: '#007bff' }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });
    }).catch(console.error);

    // Visitors Line Chart (address chart as example)
    fetchChart('/api/v1/address-chart').then(data => {
        if (!data.rows || !Array.isArray(data.rows) || !document.getElementById('lineChart')) return;
        const labels = data.rows.map(r => r.addressline || r.label || '');
        const values = data.rows.map(r => parseFloat(r.total || 0));
        new Chart(document.getElementById('lineChart').getContext('2d'), {
            type: 'line',
            data: {
                labels,
                datasets: [{ label: 'Addresses', data: values, borderColor: '#e94560', backgroundColor: 'rgba(233,69,96,0.1)', fill: true, tension: 0.4 }]
            },
            options: { responsive: true }
        });
    }).catch(console.error);

    // Items Pie Chart
    fetchChart('/api/v1/items-chart').then(data => {
        if (!data.rows || !Array.isArray(data.rows) || !document.getElementById('pieChart')) return;
        const labels = data.rows.map(r => r.items || r.label || '');
        const values = data.rows.map(r => parseFloat(r.total || 0));
        new Chart(document.getElementById('pieChart').getContext('2d'), {
            type: 'pie',
            data: {
                labels,
                datasets: [{ label: 'Items', data: values, backgroundColor: ['#007bff', '#e94560', '#f7c873', '#43aa8b', '#f3722c', '#577590'] }]
            },
            options: { responsive: true }
        });
    }).catch(console.error);

    // Most Bought Product
    fetchChart('/api/v1/most-bought-product').then(data => {
        const el = document.getElementById('mostBoughtProduct');
        if (!el) return;
        if (!data.product) {
            el.innerHTML = '<span>No data available.</span>';
            return;
        }
        el.innerHTML = `<b>${data.product.name}</b><br>Quantity Bought: <b>${data.product.total_bought}</b>`;
    }).catch(err => {
        const el = document.getElementById('mostBoughtProduct');
        if (el) el.innerHTML = 'Error loading data.';
        console.error('Most bought product error:', err);
    });

    // Most Buying User
    fetchChart('/api/v1/most-buying-user').then(data => {
        const el = document.getElementById('mostBuyingUser');
        if (!el) return;
        if (!data.user) {
            el.innerHTML = '<span>No data available.</span>';
            return;
        }
        el.innerHTML = `<b>${data.user.name}</b><br>Email: <b>${data.user.email}</b><br>Completed Orders: <b>${data.user.completed_orders}</b>`;
    }).catch(err => {
        const el = document.getElementById('mostBuyingUser');
        if (el) el.innerHTML = 'Error loading data.';
        console.error('Most buying user error:', err);
    });
});
