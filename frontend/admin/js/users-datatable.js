const token = localStorage.getItem('token');
     const getRole = localStorage.getItem('role');

    if (!token || !getRole ){
        location.href="../../status_pages/401.html"
    }else{
          if (getRole !== 'admin') {
        location.href = '../../status_pages/403.html';
    }
    };

// users-datatable.js - jQuery DataTable for admin user management
$(document).ready(function () {
    const API_BASE = '/api/v1';
    const token = localStorage.getItem('token');
    let isInfinite = false;
    let page = 1;
    let pageSize = 10;
    let loading = false;
    let currentPage = 1;
    let table;


    function userToRow(user) {
        const isActive = user.status === 'active';
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            roleHtml: `<select class='role-select' data-id='${user.id}'>\n<option value='user' ${user.role === 'user' ? 'selected' : ''}>User</option>\n<option value='admin' ${user.role === 'admin' ? 'selected' : ''}>Admin</option>\n</select>` ,
            status: `<span class="badge bg-${isActive ? 'success' : 'danger'}">${isActive ? 'Active' : 'Inactive'}</span>`,
            created_at: user.created_at ? user.created_at.split('T')[0] : '',
            actions: `
                <div class="d-flex gap-2 justify-content-center">
                    ${isActive ? 
                        `<button class='btn btn-sm btn-warning deactivate-btn' data-id='${user.id}' title="Deactivate User">Deactivate</button>` : 
                        `<button class='btn btn-sm btn-success reactivate-btn' data-id='${user.id}' title="Reactivate User">Reactivate</button>`
                    }
                    <button class='btn btn-sm btn-danger delete-user' data-id='${user.id}' title="Delete User">Delete</button>
                </div>`
        };
    }

    function fetchUsers(page = 1, append = false) {
        loading = true;
        let url = `${API_BASE}/users?page=${page}&limit=${pageSize}`;
        $.ajax({
            url,
            headers: { 'Authorization': 'Bearer ' + token },
            success: function (res) {
                let rows = (res.users || []).map(userToRow);
                if (!append) {
                    if (table) {
                        table.clear().rows.add(rows).draw();
                    } else {
                        initTable(rows);
                    }
                } else if (table) {
                    table.rows.add(rows).draw();
                }
                loading = false;
                currentPage = page; // Update currentPage after successful fetch
                if (!isInfinite) {
                    renderPagination(res.totalUsers, currentPage);
                }
            },
            error: function () {
                alert('Failed to fetch users.');
                loading = false;
            }
        });
    }

    function renderPagination(total, current) {
        $('#pagination').empty();
        const totalPages = Math.ceil(total / pageSize);
        for (let i = 1; i <= totalPages; i++) {
            const button = `<button data-page="${i}" class="${i === current ? 'active' : ''}">${i}</button>`;
            $('#pagination').append(button);
        }
    }

    function initTable(rows) {
        table = $('#usersTable').DataTable({
            data: rows,
            columns: [
                { data: 'id' },
                { data: 'name' },
                { data: 'email' },
                { data: 'roleHtml' },
                { data: 'status', className: 'text-center' },
                { data: 'created_at' },
                { data: 'actions', className: 'text-center' }
            ],
            paging: false,
            searching: true,
            info: false,
            ordering: false,
            autoWidth: false,
            destroy: true
        });
    }

    // Custom Pagination controls
    $('#prevPage').on('click', function() {
        if (currentPage > 1) {
            currentPage--;
            fetchUsers(currentPage);
        }
    });

    $('#nextPage').on('click', function() {
        currentPage++;
        fetchUsers(currentPage);
    });

    // Initial fetch
    fetchUsers(currentPage);

    // Pagination click
    $('#pagination').on('click', 'button', function () {
        currentPage = parseInt($(this).data('page'));
        fetchUsers(currentPage);
    });

    // Toggle pagination/infinite
    $('#loadPaginated').on('click', function () {
        isInfinite = false;
        currentPage = 1;
        $('#infinite-loader').hide();
        $('#pagination').show();
        if (table) table.destroy();
        fetchUsers(currentPage);
    });

    $('#loadInfinite').on('click', function () {
        isInfinite = true;
        currentPage = 1;
        if (table) table.destroy();
        fetchUsers(currentPage);
        $('#infinite-loader').show();
        $('#pagination').hide();
    });

    // Infinite scroll
    $(window).on('scroll', function () {
        if (!isInfinite || loading) return;
        if ($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
            currentPage++;
            fetchUsers(currentPage, true);
        }
    });

    // Update user role

    // Add User Modal Logic
    const addUserModal = $('#addUserModal');
    const addUserBtn = $('#addUserBtn');
    const closeButton = $('.close-button');
    const addUserForm = $('#addUserForm');

    addUserBtn.on('click', function() {
        addUserModal.css('display', 'block');
    });

    closeButton.on('click', function() {
        addUserModal.css('display', 'none');
    });

    $(window).on('click', function(event) {
        if ($(event.target).is(addUserModal)) {
            addUserModal.css('display', 'none');
        }
    });

    addUserForm.on('submit', function(e) {
        e.preventDefault();

        const name = $('#userName').val();
        const email = $('#userEmail').val();
        const password = $('#userPassword').val();
        const role = $('#userRole').val();

        $.ajax({
            url: `${API_BASE}/users/add`,
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            contentType: 'application/json',
            data: JSON.stringify({ name, email, password, role }),
            success: function(response) {
                alert(response.message);
                addUserModal.css('display', 'none');
                addUserForm[0].reset();
                fetchUsers(currentPage); // Refresh user list
            },
            error: function(xhr, status, error) {
                alert('Error adding user: ' + (xhr.responseJSON ? xhr.responseJSON.message : error));
            }
        });
    });

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
                alert('Role updated.');
            },
            error: function () {
                alert('Failed to update role.');
            }
        });
    });

    // Deactivate user
    $('#usersTable').on('click', '.deactivate-btn', function () {
        const $btn = $(this);
        if ($btn.prop('disabled')) return;
        
        const userId = $btn.data('id');
        const originalHtml = $btn.html();
        
        // Show loading state
        $btn.prop('disabled', true)
            .html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');
            
        $.ajax({
            url: `${API_BASE}/users/${userId}/deactivate`,
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + token },
            success: function (response) {
                showNotification('User has been deactivated successfully', 'success');
                fetchUsers(currentPage);
            },
            error: function (xhr) {
                let message = 'Failed to deactivate user';
                if (xhr.status === 404) {
                    message = 'User not found. This user may have been deleted.';
                } else if (xhr.responseJSON?.error) {
                    message = xhr.responseJSON.error;
                }
                showNotification(message, 'danger');
                $btn.prop('disabled', false).html(originalHtml);
            }
        });
    });

    // Reactivate user
    $('#usersTable').on('click', '.reactivate-btn', function () {
        const $btn = $(this);
        if ($btn.prop('disabled')) return;
        
        const userId = $btn.data('id');
        const originalHtml = $btn.html();
        
        // Show loading state
        $btn.prop('disabled', true)
            .html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');
            
        $.ajax({
            url: `${API_BASE}/users/${userId}/reactivate`,
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + token },
            success: function (response) {
                showNotification('User has been reactivated successfully', 'success');
                fetchUsers(currentPage);
            },
            error: function (xhr) {
                let message = 'Failed to reactivate user';
                if (xhr.status === 404) {
                    message = 'User not found. This user may have been deleted.';
                } else if (xhr.responseJSON?.error) {
                    message = xhr.responseJSON.error;
                }
                showNotification(message, 'danger');
                $btn.prop('disabled', false).html(originalHtml);
            }
        });
    }
    );

    // Update user status (role select change handler - kept for completeness, though deactivate/reactivate buttons are primary)
    $('#usersTable').on('change', '.status-select', function () {
        const userId = $(this).data('id');
        const status = $(this).val();
        let url = '';
        let successMessage = '';
        let errorMessage = '';

        if (status === 'deactivated') {
            url = `${API_BASE}/users/${userId}/deactivate`;
            successMessage = 'User deactivated!';
            errorMessage = 'Failed to deactivate user.';
        } else if (status === 'active') {
            url = `${API_BASE}/users/${userId}/reactivate`;
            successMessage = 'User reactivated!';
            errorMessage = 'Failed to reactivate user.';
        } else {
            return; // Should not happen with 'active' and 'deactivated' options
        }

        $.ajax({
            url: url,
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + token },
            success: function () {
                alert(successMessage);
                fetchUsers(currentPage);
            },
            error: function (xhr) {
                if (xhr.status === 404) {
                    alert('User not found or already in the selected status.');
                } else if (xhr.responseJSON && xhr.responseJSON.error) {
                    alert('Error: ' + xhr.responseJSON.error);
                } else {
                    alert(errorMessage + ' Please try again.');
                }
                // Re-fetch to ensure UI reflects actual state if update failed
                fetchUsers(currentPage);
            }
        });
    });

    // Delete user
    $('#usersTable').on('click', '.delete-user', function () {
        const userId = $(this).data('id');
        if (!confirm('Are you sure you want to delete this user?')) return;
        $.ajax({
            url: `${API_BASE}/users/admin/${userId}`,
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token },
            success: function () {
                alert('User deleted.');
                if (isInfinite) {
                    fetchUsers(1);
                } else {
                    fetchUsers(table.page.info().page + 1);
                }
            },
            error: function () {
                alert('Failed to delete user.');
            }
        });
    });

    // Add User button handler
    $('#addUserBtn').on('click', function() {
        alert('Add User functionality to be implemented.');
        // TODO: Implement user creation modal or redirect to a user creation page
    });

    // Initial load
    fetchUsers(1);
});
