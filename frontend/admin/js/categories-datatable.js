const token = localStorage.getItem('token');
const getRole = localStorage.getItem('role');

if (!token || !getRole) {
    location.href = "../../status_pages/401.html";
} else {
    if (getRole !== 'admin') {
        location.href = '../../status_pages/403.html';
    }
}

$(document).ready(function () {
    const API_BASE = '/api/v1';
    let table;
  
    function categoryToRow(category) {
        return {
            id: category.id,
            name: category.name,
            actions: `
                <div class="d-flex gap-2">
                    <button class='btn btn-sm btn-primary edit-category' data-id='${category.id}'>
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class='btn btn-sm btn-danger delete-category' data-id='${category.id}'>
                        <i class="bi bi-trash"></i>
                    </button>
                </div>`
        };
    }

    function fetchCategories() {
        $.ajax({
            url: `${API_BASE}/categories`,
            headers: { 'Authorization': 'Bearer ' + token },
            success: function (res) {
                let rows = (res.categories || []).map(categoryToRow);
                if (!table) {
                    initTable(rows);
                } else {
                    table.clear().rows.add(rows).draw();
                }
            },
            error: function (xhr, status, error) {
                console.error("Error fetching categories:", {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    responseText: xhr.responseText,
                    response: xhr.responseJSON,
                    error: error
                });
                showNotification("Failed to fetch categories. Please try again.", "danger");
            }
        });
    }

    function initTable(rows) {
        table = $('#categoriesTable').DataTable({
            data: rows,
            columns: [
                { data: 'id' },
                { data: 'name' },
                { 
                    data: 'actions',
                    orderable: false,
                    searchable: false,
                    className: 'text-center'
                }
            ],
            order: [[0, 'desc']], // Sort by ID descending by default
            paging: true,
            searching: true,
            info: true,
            autoWidth: false,
            destroy: true,
            lengthChange: true,
            language: {
                search: 'Search categories:',
                lengthMenu: 'Show _MENU_ categories per page',
                emptyTable: 'No categories found',
                zeroRecords: 'No matching categories found'
            }
        });
    }

    // Function to show notifications
    function showNotification(message, type = 'success') {
        const toast = $('#notificationToast');
        const toastBody = toast.find('.toast-body');
        
        toast.removeClass('bg-success bg-danger bg-warning');
        toast.addClass(`bg-${type} text-white`);
        toastBody.text(message);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }

    // Initial load
    fetchCategories();

    // Add Category handling
    $(document).on('click', '[data-bs-target="#categoryModal"]', function () {
        $('#categoryModalTitle').text('Add Category');
        $('#categoryForm')[0].reset();
        $('#categoryId').val('');
        $('#categoryName').val('').removeClass('is-invalid');
    });

    // Save category (add/edit)
    $('#categoryForm').on('submit', function (e) {
        e.preventDefault();
        
        // Prevent multiple submissions
        if ($(this).data('submitting')) {
            return;
        }
        
        const id = $('#categoryId').val();
        const name = $('#categoryName').val().trim();
        
        if (!name) {
            $('#categoryName').addClass('is-invalid');
            showNotification('Category name is required', 'danger');
            return;
        }
        
        if (name.length < 2) {
            $('#categoryName').addClass('is-invalid');
            showNotification('Category name must be at least 2 characters long', 'danger');
            return;
        }
        
        // Additional validation for special characters and length
        if (name.length > 100) {
            $('#categoryName').addClass('is-invalid');
            showNotification('Category name must be less than 100 characters', 'danger');
            return;
        }
        
        $('#categoryName').removeClass('is-invalid');
        
        const url = id ? `${API_BASE}/categories/${id}` : `${API_BASE}/categories`;
        const method = id ? 'PUT' : 'POST';
        
        // Mark form as submitting
        $(this).data('submitting', true);
        
        // Handle submit button state
        const submitBtn = $(this).find('button[type="submit"]');
        const originalText = submitBtn.html();
        submitBtn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...');
        
        // Generate a unique slug on frontend as fallback
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substr(2, 4);
        let baseSlug = name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
            .replace(/\s+/g, '-')          // Replace spaces with hyphens
            .replace(/-+/g, '-')           // Replace multiple hyphens with single
            .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
        
        // Ensure we always have a valid slug
        if (!baseSlug || baseSlug.length < 1) {
            baseSlug = 'category';
        }
        
        // For now, let's just send the name and let backend handle everything
        // Since the backend is ignoring our slug anyway
        const requestData = {
            name: name
        };

        // Log the request data for debugging
        console.log('Sending category data:', {
            url: url,
            method: method,
            data: requestData
        });
        
        $.ajax({
            url: url,
            method: method,
            headers: { 
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(requestData),
            success: function (res) {
                showNotification(res.message || `Category ${id ? 'updated' : 'created'} successfully`, 'success');
                const categoryModal = bootstrap.Modal.getInstance($('#categoryModal'));
                if (categoryModal) {
                    categoryModal.hide();
                }
                $('#categoryForm')[0].reset();
                fetchCategories(); // Refresh table
            },
            error: function (xhr, status, error) {
                // Log detailed error information
                console.error('Category save error:', {
                    request: {
                        url: url,
                        method: method,
                        data: requestData
                    },
                    response: {
                        status: xhr.status,
                        statusText: xhr.statusText,
                        responseText: xhr.responseText,
                        parsedResponse: xhr.responseJSON,
                        error: error
                    }
                });
                
                let message = 'Failed to save category';
                
                try {
                    if (xhr.status === 0) {
                        message = 'Network error. Please check your connection and try again.';
                    } else if (xhr.responseText) {
                        const response = JSON.parse(xhr.responseText);
                        if (response.error) {
                            message = response.error;
                            // Handle specific database errors
                            if (response.details?.sqlMessage) {
                                console.error('SQL Error:', response.details.sqlMessage);
                                if (response.details.sqlMessage.includes('Duplicate entry') && response.details.sqlMessage.includes('slug')) {
                                    message = 'Category name conflicts with existing category. Please choose a different name.';
                                } else if (response.details.sqlMessage.includes('categories_slug_unique')) {
                                    message = 'Category name conflicts with existing category. Please choose a different name.';
                                } else if (response.details.code === 'ER_DUP_ENTRY') {
                                    message = 'This category name already exists or conflicts with another category. Please choose a different name.';
                                } else {
                                    message = 'Database error occurred. Please try a different category name.';
                                }
                            }
                        } else if (response.message) {
                            message = response.message;
                        }
                    }
                } catch (e) {
                    console.error('Error parsing response:', e);
                    message = `Server error (${xhr.status}). Please try again.`;
                }
                
                showNotification(message, 'danger');
            },
            complete: function() {
                submitBtn.prop('disabled', false).html(originalText);
                // Reset submitting state
                $('#categoryForm').data('submitting', false);
            }
        });
    });

    // Edit Category
    $(document).on('click', '.edit-category', function () {
        const id = $(this).data('id');
        
        // Show loading state
        $(this).prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');
        
        $.ajax({
            url: `${API_BASE}/categories/${id}`,
            headers: { 'Authorization': 'Bearer ' + token },
            success: function (res) {
                const category = res.category;
                if (category) {
                    $('#categoryModalTitle').text('Edit Category');
                    $('#categoryId').val(category.id);
                    $('#categoryName').val(category.name).removeClass('is-invalid');
                    
                    // Store original name and slug for comparison
                    $('#categoryForm').data('originalName', category.name || '');
                    $('#categoryForm').data('originalSlug', category.slug || '');
                    
                    const categoryModal = new bootstrap.Modal($('#categoryModal'));
                    categoryModal.show();
                } else {
                    showNotification('Category not found', 'danger');
                }
            },
            error: function (xhr) {
                const message = xhr.responseJSON?.message || xhr.responseJSON?.error || 'Failed to load category';
                showNotification(message, 'danger');
            },
            complete: function() {
                // Restore button state
                $('.edit-category[data-id="' + id + '"]')
                    .prop('disabled', false)
                    .html('<i class="bi bi-pencil-square"></i>');
            }
        });
    });

    // Delete Category
    $(document).on('click', '.delete-category', function () {
        const id = $(this).data('id');
        const name = table.row($(this).closest('tr')).data().name;
        
        if (confirm(`Are you sure you want to delete category "${name}"?`)) {
            $.ajax({
                url: `${API_BASE}/categories/${id}`,
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token },
                success: function (res) {
                    showNotification(res.message || 'Category deleted successfully', 'success');
                    fetchCategories(); // Refresh table
                },
                error: function (xhr) {
                    const message = xhr.responseJSON?.message || xhr.responseJSON?.error || 'Failed to delete category';
                    showNotification(message, 'danger');
                }
            });
        }
    });
});