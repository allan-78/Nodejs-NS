$(document).ready(function() {
    const API_BASE = window.API_BASE || '/api/v1';

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

    // Check authentication
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || !role) {
        window.location.href = "/status_pages/401.html";
        return;
    }

    if (role !== 'admin') {
        window.location.href = "/status_pages/403.html";
        return;
    }

    // Load categories into select
    function loadCategories() {
        $.ajax({
            url: `${API_BASE}/categories`,
            headers: { 'Authorization': 'Bearer ' + token },
            success: function(res) {
                const $select = $('#productCategory');
                $select.empty().append('<option value="">Select Category</option>');
                
                (res.categories || []).forEach(cat => {
                    $select.append(`
                        <option value="${cat.id}">${cat.name}</option>
                    `);
                });
            },
            error: function() {
                showNotification('Failed to load categories', 'danger');
            }
        });
    }

    // Call loadCategories when page loads
    loadCategories();

    // Handle image preview
    $('#productImages').on('change', function() {
        const files = this.files;
        $('#productImagePreview').empty();
        
        Array.from(files).forEach(file => {
            // Validate file
            if (!file.type.match('image.*')) {
                showNotification('Please upload only image files', 'danger');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                showNotification('Image size should not exceed 5MB', 'danger');
                return;
            }
            
            // Show preview
            const reader = new FileReader();
            reader.onload = function(e) {
                $('#productImagePreview').append(`
                    <div class="image-preview-item">
                        <img src="${e.target.result}" class="product-img-thumb">
                    </div>
                `);
            };
            reader.readAsDataURL(file);
        });
    });

    // Handle form submission
    $('#productForm').on('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        
        // Validate form
        const name = $('#productName').val().trim();
        const price = parseFloat($('#productPrice').val());
        const stock = parseInt($('#productStock').val());
        const description = $('#productDescription').val().trim();
        const category = $('#productCategory').val();
        
        if (!name || !price || !stock || !description || !category) {
            showNotification('Please fill out all required fields', 'danger');
            return;
        }
        
        if (price <= 0) {
            showNotification('Price must be greater than 0', 'danger');
            return;
        }
        
        if (stock < 0) {
            showNotification('Stock cannot be negative', 'danger');
            return;
        }

        // Make API call
        $.ajax({
            url: `${API_BASE}/items`,
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            data: formData,
            processData: false,
            contentType: false,
            success: function() {
                showNotification('Product created successfully', 'success');
                // Reset form
                $('#productForm')[0].reset();
                $('#productImagePreview').empty();
            },
            error: function(xhr) {
                const message = xhr.responseJSON?.error || 'Failed to save product';
                showNotification(message, 'danger');
            }
        });
    });

    // Reset button
    $('#resetForm').on('click', function() {
        $('#productForm')[0].reset();
        $('#productImagePreview').empty();
    });
});
