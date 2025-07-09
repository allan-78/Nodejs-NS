const API_BASE = window.API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:3000/api/v1`;
const token = localStorage.getItem('token');

let currentPage = 1;
let pageSize = 10;
let isInfinite = false;
let loading = false;
let reachedEnd = false;

function fetchUsers(page = 1, append = false) {
    if (!token) return;
    loading = true;
    $('#infinite-loader').show();
    $.ajax({
        url: `${API_BASE}/users?page=${page}&limit=${pageSize}`,
        headers: { 'Authorization': 'Bearer ' + token },
        success: function (res) {
            renderUsers(res.users, append);
            if (isInfinite && res.users.length < pageSize) reachedEnd = true;
            loading = false;
            $('#infinite-loader').hide();
        },
        error: function () {
            loading = false;
            $('#infinite-loader').hide();
        }
    });
}

function renderUsers(users, append = false) {
    const $tbody = $('#usersTable tbody');
    if (!append) $tbody.empty();
    users.forEach(user => {
        $tbody.append(`
            <tr data-id="${user.id}" class="${user.status === 'active' ? '' : 'deactivated'}">
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <select class="role-select" data-id="${user.id}">
                        <option value="customer" ${user.role === 'customer' ? 'selected' : ''}>Customer</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </td>
                <td>${user.status === 'active' ? 'Active' : 'Inactive'}</td>
                <td>${user.created_at ? user.created_at.split('T')[0] : ''}</td>
                <td class="actions">
                    <button class="deactivate-btn" data-id="${user.id}" ${user.status !== 'active' ? 'disabled' : ''}>Deactivate</button>
                    <button class="reactivate-btn" data-id="${user.id}" ${user.status === 'active' ? 'disabled' : ''}>Reactivate</button>
                </td>
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
    fetchUsers(currentPage);
    // Get total count for pagination
    $.ajax({
        url: `${API_BASE}/users/count`,
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
    $('#usersTable tbody').empty();
    fetchUsers(currentPage);
}

$(document).ready(function () {
    loadPaginated();
    $('#loadPaginated').click(loadPaginated);
    $('#loadInfinite').click(loadInfinite);

    // Pagination click
    $('#pagination').on('click', 'button', function () {
        currentPage = parseInt($(this).data('page'));
        fetchUsers(currentPage);
        renderPagination($('#pagination button').length * pageSize, currentPage);
    });

    // Infinite scroll
    $(window).on('scroll', function () {
        if (!isInfinite || loading || reachedEnd) return;
        if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
            currentPage++;
            fetchUsers(currentPage, true);
        }
    });

    // Update role
    $('#usersTable').on('change', '.role-select', function () {
        const userId = $(this).data('id');
        const role = $(this).val();
        $.ajax({
            url: `${API_BASE}/users/role`,
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + token },
            contentType: 'application/json',
            data: JSON.stringify({ userId, role }),
            success: function () {
                alert('Role updated!');
            }
        });
    });

    // Deactivate user
    $('#usersTable').on('click', '.deactivate-btn', function () {
        const $btn = $(this);
        if ($btn.prop('disabled')) return;
        $btn.prop('disabled', true).text('Deactivating...');
        const userId = $btn.data('id');
        $.ajax({
            url: `${API_BASE}/users/${userId}/deactivate`,
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + token },
            success: function () {
                alert('User deactivated!');
                fetchUsers(currentPage);
            },
            error: function (xhr) {
                if (xhr.status === 404) {
                    alert('User not found. This user may have already been deleted.');
                } else if (xhr.responseJSON && xhr.responseJSON.error) {
                    alert('Error: ' + xhr.responseJSON.error);
                } else {
                    alert('Failed to deactivate user. Please try again.');
                }
                $btn.prop('disabled', false).text('Deactivate');
            }
        });
    });

    // Reactivate user
    $('#usersTable').on('click', '.reactivate-btn', function () {
        const $btn = $(this);
        if ($btn.prop('disabled')) return;
        $btn.prop('disabled', true).text('Reactivating...');
        const userId = $btn.data('id');
        $.ajax({
            url: `${API_BASE}/users/${userId}/reactivate`,
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + token },
            success: function () {
                alert('User reactivated!');
                fetchUsers(currentPage);
            },
            error: function (xhr) {
                if (xhr.status === 404) {
                    alert('User not found.');
                } else if (xhr.responseJSON && xhr.responseJSON.error) {
                    alert('Error: ' + xhr.responseJSON.error);
                } else {
                    alert('Failed to reactivate user. Please try again.');
                }
                $btn.prop('disabled', false).text('Reactivate');
            }
        });
    });
});
