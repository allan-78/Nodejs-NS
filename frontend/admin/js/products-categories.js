// products-categories.js - Shared functionality for products and categories
$(document).ready(function () {
    // Check for authentication and admin role
    function checkAuth() {
        const authToken = localStorage.getItem('token');
        const userRole = localStorage.getItem('role');

        if (!authToken || !userRole) {
            location.href = "../../status_pages/401.html";
            return false;
        }
        
        if (userRole !== 'admin') {
            location.href = '../../status_pages/403.html';
            return false;
        }
        
        return true;
    }

    // Exit if not authenticated
    if (!checkAuth()) return;

    // Ensure API_BASE is defined (shared with products-datatable.js)
    if (typeof window.API_BASE === 'undefined') {
        window.API_BASE = '/api/v1';
    }

    // Function to load categories into select element
    function loadCategories(selectedId, callback) {
        if (!localStorage.getItem('token')) {
            console.error('No authentication token found');
            showNotification('Please log in again', 'danger');
            setTimeout(() => {
                window.location.href = '../user/login.html';
            }, 2000);
            return;
        }

        $.ajax({
            url: `${window.API_BASE}/categories`,
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
            success: function(res) {
                const $cat = $('#productCategory');
                $cat.empty();
                $cat.append('<option value="">Select Category</option>');
                
                (res.categories || []).forEach(cat => {
                    $cat.append(`<option value="${cat.id}"${selectedId == cat.id ? ' selected' : ''}>${cat.name}</option>`);
                });
                
                if (selectedId) {
                    $cat.val(selectedId);
                }
                
                if (typeof callback === 'function') {
                    callback();
                }
            },
            error: function(xhr) {
                console.error('Failed to load categories:', xhr.responseText);
                showNotification('Failed to load categories', 'danger');
            }
        });
    }

    // Function to load product stats
    function loadProductStats() {
        $.ajax({
            url: `${window.API_BASE}/items`,
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
            success: function(res) {
                const products = res.products || res.items || [];
                const stats = {
                    totalProducts: products.length,
                    outOfStock: products.filter(p => p.stock <= 0).length,
                    lowStock: products.filter(p => p.stock > 0 && p.stock <= 10).length
                };

                // Update stats in the UI
                $('#totalProducts').text(stats.totalProducts || 0);
                $('#outOfStock').text(stats.outOfStock || 0);
                $('#lowStock').text(stats.lowStock || 0);

                // Add alerts for low stock and out of stock
                if (stats.outOfStock > 0) {
                    showNotification(`${stats.outOfStock} products are out of stock!`, 'danger');
                }
                if (stats.lowStock > 0) {
                    showNotification(`${stats.lowStock} products are running low on stock!`, 'warning');
                }
            },
            error: function(xhr) {
                console.error('Failed to load product stats:', xhr.responseText);
                $('#totalProducts').text('0');
                $('#outOfStock').text('0');
                $('#lowStock').text('0');
            }
        });
    }

    // Load product stats every 5 minutes
    loadProductStats();
    setInterval(loadProductStats, 300000);

    // Event handler for add product button
    $('#addProductBtn').on('click', function() {
        loadCategories();
    });

    // Event handler for edit product button
    $(document).on('click', '.edit-product', function() {
        const id = $(this).data('id');
        $.ajax({
            url: `${window.API_BASE}/items/${id}`,
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
            success: function(res) {
                const product = res.product || res;
                loadCategories(product.category_id, function() {
                    // Check if stock is low
                    const stockThreshold = 10; // Configurable threshold
                    if (product.stock <= 0) {
                        $('#stockAlert').html('This product is out of stock!').show();
                    } else if (product.stock <= stockThreshold) {
                        $('#stockAlert').html(`Low stock alert! Only ${product.stock} items remaining.`).show();
                    } else {
                        $('#stockAlert').hide();
                    }
                });
            },
            error: function() {
                showNotification('Failed to load product details', 'danger');
            }
        });
    });

    // Stock monitoring
    $('#productStock').on('input', function() {
        const stock = parseInt($(this).val()) || 0;
        const threshold = 10; // Configurable threshold
        
        if (stock <= 0) {
            $('#stockAlert').html('Warning: Product will be out of stock!').show();
        } else if (stock <= threshold) {
            $('#stockAlert').html(`Warning: Stock level (${stock}) is below recommended minimum (${threshold})`).show();
        } else {
            $('#stockAlert').hide();
        }
    });

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
});
