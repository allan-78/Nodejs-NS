const API_BASE = window.API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:3000/api/v1`;
const token = localStorage.getItem('token');
     const getRole = localStorage.getItem('role');

    if (!token || !getRole ){
        location.href="../../status_pages/401.html"
    }else{
          if (getRole !== 'admin') {
        location.href = '../../status_pages/403.html';
    }
    };

let currentPage = 1;
let pageSize = 10;
let isInfinite = false;
let loading = false;
let reachedEnd = false;

function fetchOrders(page = 1, append = false) {
    if (!token) return;
    loading = true;
    $('#infinite-loader').show();
    $.ajax({
        url: `${API_BASE}/orders?page=${page}&limit=${pageSize}`,
        headers: { 'Authorization': 'Bearer ' + token },
        success: function (res) {
            if (res.orders) {
                res.orders.forEach(order => {
                    if (!order.name && order.user_name) order.name = order.user_name;
                });
            }
            renderOrders(res.orders, append);
            if (isInfinite && res.orders.length < pageSize) reachedEnd = true;
            loading = false;
            $('#infinite-loader').hide();
        },
        error: function () {
            loading = false;
            $('#infinite-loader').hide();
        }
    });
}

function renderOrders(orders, append = false) {
    const $tbody = $('#ordersTable tbody');
    if (!append) $tbody.empty();
    orders.forEach(order => {
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
        $tbody.append(`
            <tr data-id="${order.id}" class="${order.status}">
                <td>${order.id}</td>
                <td>${order.name || order.user_name || order.user_email || order.user_id}</td>
                <td>${itemsHtml}</td>
                <td>
                    <select class="status-select" data-id="${order.id}">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td>$${total.toFixed(2)}</td>
                <td>${order.created_at ? order.created_at.split('T')[0] : ''}</td>
            </tr>
        `);
    });
}

function renderPagination(total, page) {
    const $p = $('#pagination');
    $p.empty();
    const totalPages = Math.ceil(total / pageSize);
    for (let i = 1; i <= totalPages; i++) {
        $p.append(`<button class="${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`);
    }
}

function loadPaginated() {
    isInfinite = false;
    currentPage = 1;
    reachedEnd = false;
    $('#pagination').show();
    $('#infinite-loader').hide();
    fetchOrders(currentPage);
    // Get total count for pagination
    $.ajax({
        url: `${API_BASE}/orders/count`,
        headers: { 'Authorization': 'Bearer ' + token },
        success: function (res) {
            renderPagination(res.total, currentPage);
        }
    });
}

function loadInfinite() {
    isInfinite = true;
    currentPage = 1;
    reachedEnd = false;
    $('#pagination').hide();
    $('#ordersTable tbody').empty();
    fetchOrders(currentPage);
}

$(document).ready(function () {
    loadPaginated();
    $('#loadPaginated').click(loadPaginated);
    $('#loadInfinite').click(loadInfinite);

    // Pagination click
    $('#pagination').on('click', 'button', function () {
        currentPage = parseInt($(this).data('page'));
        fetchOrders(currentPage);
        renderPagination($('#pagination button').length * pageSize, currentPage);
    });

    // Infinite scroll
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
        $.ajax({
            url: `${API_BASE}/orders/admin/orders/${orderId}/status`,
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + token },
            contentType: 'application/json',
            data: JSON.stringify({ status }),
            success: function (res) {
                alert('Order status updated! Email sent to user.');
                fetchOrders(currentPage);
            },
            error: function (xhr) {
                alert('Failed to update order status.');
            }
        });
    });
});
