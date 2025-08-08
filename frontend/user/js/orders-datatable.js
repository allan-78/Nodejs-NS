// orders-datatable.js - jQuery DataTable for user order history
$(document).ready(function () {
    const API_BASE = '/api/v1';
    const token = localStorage.getItem('token');
    let table;

    function orderToRow(order) {
        return {
            id: order.id,
            status: `<span class='badge badge-${order.status === 'completed' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'}'>${order.status}</span>`,
            total: `₱${Number(order.total_price).toFixed(2)}`,
            created_at: order.created_at ? new Date(order.created_at).toLocaleString() : '',
            items: order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')
        };
    }

    function fetchOrders() {
        $.ajax({
            url: `${API_BASE}/orders?user_id=${getUserId()}`,
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
            success: function (data) {
                let rows = (data.orders || []).map(orderToRow);
                if (table) table.clear().rows.add(rows).draw();
                else initTable(rows);
            },
            error: function () {
                if (table) table.clear().draw();
                alert('Failed to load orders.');
            }
        });
    }

    function initTable(rows) {
        table = $('#ordersTable').DataTable({
            data: rows,
            columns: [
                { data: 'id', title: 'Order ID' },
                { data: 'created_at', title: 'Date' },
                { data: 'status', title: 'Status' },
                { data: 'total', title: 'Total' },
                { data: 'items', title: 'Items Ordered' }
            ],
            paging: true,
            searching: true,
            info: true,
            ordering: true,
            autoWidth: false,
            destroy: true
        });
    }

    // Helper to get user id (from localStorage or JWT)
    function getUserId() {
        // You may need to adjust this depending on your auth implementation
        return localStorage.getItem('user_id');
    }

    fetchOrders();
});
