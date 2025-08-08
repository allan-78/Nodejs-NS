const token = localStorage.getItem('token');
     const getRole = localStorage.getItem('role');

    if (!token || !getRole ){
        location.href="../../status_pages/401.html"
    }else{
          if (getRole !== 'admin') {
        location.href = '../../status_pages/403.html';
    }
    };


$(document).ready(function () {
    const API_BASE = window.API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:3000/api/v1`;
    const token = localStorage.getItem('token');
    let isInfinite = false;
    let currentPage = 1;
    let pageSize = 10;
    let loading = false;
    let reachedEnd = false;
    let allOrders = [];

   
    // DataTable instance
    const table = $('#ordersTable').DataTable({
        paging: true,
        pageLength: pageSize,
        lengthChange: true, // <-- enable show entries
        searching: true,    // <-- enable search box
        info: true,         // <-- show info
        ordering: true,     // <-- enable column sorting
        autoWidth: false,
        columns: [
            { data: 'id' },
            { data: 'name' },
            { data: 'itemsHtml' },
            { data: 'statusHtml' },
            { data: 'total' },
            { data: 'created_at' },
            { data: 'actions' }
        ]
    });

    function orderToRow(order) {
        let itemsHtml = '';
        let total = 0;
        if (order.items && order.items.length) {
            itemsHtml = '<ul style="margin:0;padding-left:18px;">';
            order.items.forEach(item => {
                itemsHtml += `<li>${item.name} x${item.quantity} @ $${item.price}</li>`;
                total += (item.price * item.quantity);
            });
            itemsHtml += '</ul>';
        }
        return {
            id: order.id,
            name: order.name || order.user_name || order.user_email || order.user_id,
            itemsHtml,
            statusHtml: `<select class='status-select' data-id='${order.id}'>\n<option value='pending' ${order.status === 'pending' ? 'selected' : ''}>Pending</option>\n<option value='completed' ${order.status === 'completed' ? 'selected' : ''}>Completed</option>\n<option value='failed' ${order.status === 'failed' ? 'selected' : ''}>Failed</option>
<option value='refunded' ${order.status === 'refunded' ? 'selected' : ''}>Refunded</option>\n</select>` ,
            total: `$${total.toFixed(2)}`,
            created_at: order.created_at ? order.created_at.split('T')[0] : '',
            actions: `
                <div class="d-flex gap-2">
                    <button class='btn btn-sm btn-danger delete-order' data-id='${order.id}'>
                        <i class="bi bi-trash"></i>
                    </button>
                </div>`
        };
    }

    function fetchOrders(page = 1, append = false) {
        loading = true;
        let url = `${API_BASE}/orders/admin/orders?page=${page}&limit=${pageSize}`; // Changed to admin endpoint
        $.ajax({
            url,
            headers: { 'Authorization': 'Bearer ' + token },
            success: function (res) {
                let rows = (res.orders || []).map(orderToRow);
                if (isInfinite) {
                    if (append) {
                        allOrders = allOrders.concat(rows);
                    } else {
                        allOrders = rows;
                    }
                    table.clear().rows.add(allOrders).draw(false);
                    if (rows.length < pageSize) reachedEnd = true;
                } else {
                    allOrders = rows;
                    table.clear().rows.add(rows).draw();
                }
                loading = false;
            },
            error: function () { loading = false; }
        });
    }

    // Initial load: paginated
    fetchOrders(1);

    // Pagination button
    $('#loadPaginated').on('click', function () {
        isInfinite = false;
        currentPage = 1;
        reachedEnd = false;
        table.page.len(pageSize).draw();
        table.settings()[0].oFeatures.bPaginate = true;
        fetchOrders(1);
    });

    // Infinite scroll button
    $('#loadInfinite').on('click', function () {
        isInfinite = true;
        currentPage = 1;
        reachedEnd = false;
        allOrders = [];
        table.clear().draw();
        table.settings()[0].oFeatures.bPaginate = false;
        fetchOrders(1);
    });

    // Infinite scroll event
    $(window).on('scroll', function () {
        if (!isInfinite || loading || reachedEnd) return;
        if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
            currentPage++;
            fetchOrders(currentPage, true);
        }
    });

    // Update order status
    $('#ordersTable').on('change', '.status-select', function () {
        const orderId = $(this).data('id');
        const status = $(this).val();
        // Allow saving even if no other fields are changed (status is always present)
        $.ajax({
            url: `${API_BASE}/orders/admin/orders/${orderId}/status`,
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + token },
            contentType: 'application/json',
            data: JSON.stringify({ status }),
            success: function (res) {
                alert('Order status updated! Email sent to user.');
                if (isInfinite) {
                    fetchOrders(1);
                } else {
                    fetchOrders(table.page.info().page + 1);
                }
            },
            error: function (xhr) {
                alert('Failed to update order status.');
            }
        });
    });

    // Delete order
    $('#ordersTable').on('click', '.delete-order', function () {
        const orderId = $(this).data('id');
        if (!confirm('Are you sure you want to delete this order?')) return;
        $.ajax({
            url: `${API_BASE}/orders/admin/orders/${orderId}`,
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token },
            success: function () {
                alert('Order deleted.');
                if (isInfinite) {
                    fetchOrders(1);
                } else {
                    fetchOrders(table.page.info().page + 1);
                }
            },
            error: function () {
                alert('Failed to delete order.');
            }
        });
    });
});
