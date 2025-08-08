// Use existing API_BASE or create it if it doesn't exist
window.API_BASE = window.API_BASE || window.API_BASE_URL || 'http://localhost:3000/api/v1';

// Format currency with commas
function formatCurrency(amount) {
    return '₱' + Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Format date nicely
function formatDate(dateString) {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get status badge HTML
function getStatusBadge(status) {
    const statusClasses = {
        'pending': 'pending',
        'completed': 'completed',
        'cancelled': 'cancelled',
        'processing': 'pending',
        'shipped': 'completed',
        'delivered': 'completed'
    };
    const badgeClass = statusClasses[status.toLowerCase()] || 'pending';
    return `<span class="status-badge ${badgeClass}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
}

// Format image path
function formatImagePath(img) {
    if (!img) {
        return '/images/no-image.png';
    }
    if (/^https?:\/\//.test(img) || img.startsWith('/')) {
        return img;
    }
    if (img.includes('products/')) {
        return '/images/' + img;
    }
    return '/images/products/' + img;
}

// Show order details in modal
function showOrderDetails(order) {
    let total = 0;
    const detailsHtml = `
        <div class="p-3">
            <div class="row g-4 mb-4">
                <div class="col-sm-6">
                    <div class="border rounded p-3">
                        <h6 class="text-muted mb-2">Order Date</h6>
                        <div>${formatDate(order.created_at)}</div>
                    </div>
                </div>
                <div class="col-sm-6">
                    <div class="border rounded p-3">
                        <h6 class="text-muted mb-2">Status</h6>
                        <div>${getStatusBadge(order.status)}</div>
                    </div>
                </div>
            </div>

            <h5 class="mb-3">Order Items</h5>
            ${order.items.map(item => {
                const subtotal = Number(item.price) * item.quantity;
                total += subtotal;
                return `
                    <div class="card mb-3 order-card">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-md-2 col-3">
                                    <img src="${formatImagePath(item.image)}" 
                                         class="item-image" alt="${item.name}">
                                </div>
                                <div class="col-md-5 col-9">
                                    <h6 class="mb-1">${item.name}</h6>
                                    <small class="text-muted">Qty: ${item.quantity}</small>
                                </div>
                                <div class="col-md-2 col-4 mt-3 mt-md-0">
                                    <small class="text-muted">Price</small>
                                    <div>${formatCurrency(item.price)}</div>
                                </div>
                                <div class="col-md-3 col-8 mt-3 mt-md-0 text-md-end">
                                    <small class="text-muted">Subtotal</small>
                                    <div class="fw-bold">${formatCurrency(subtotal)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}

            <div class="card mt-4">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6 class="text-muted mb-3">Payment Details</h6>
                            <p class="mb-1">Total Amount: ${formatCurrency(total)}</p>
                            <p class="mb-0">Payment Method: Cash on Delivery</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    $('#orderDetailsContent').html(detailsHtml);
    new bootstrap.Modal('#orderDetailsModal').show();
}

$(document).ready(function() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        $('#orders-container').html(`
            <div class="text-center py-5">
                <div class="display-1 text-muted mb-4">
                    <i class="fas fa-user-lock"></i>
                </div>
                <h3 class="text-muted mb-3">Please Log In</h3>
                <p class="text-muted mb-4">You must be logged in to view your orders</p>
                <a href="login.html" class="btn btn-primary btn-lg px-4">
                    <i class="fas fa-sign-in-alt me-2"></i>Log In
                </a>
            </div>
        `);
        return;
    }

    // Show loading state
    $('#orders-container').html(`
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <div class="mt-3">Loading your orders...</div>
        </div>
    `);

    // Fetch orders
    $.ajax({
        url: `${API_BASE}/transaction/list`,
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token },
        success: function(data) {
            if (!data.transactions || data.transactions.length === 0) {
                $('#orders-container').html(`
                    <div class="text-center py-5">
                        <div class="display-1 text-muted mb-4">
                            <i class="fas fa-shopping-bag"></i>
                        </div>
                        <h3 class="text-muted mb-3">No Orders Yet</h3>
                        <p class="text-muted mb-4">When you make purchases, your orders will appear here</p>
                        <a href="home.html" class="btn btn-primary btn-lg px-4">
                            <i class="fas fa-shopping-cart me-2"></i>Start Shopping
                        </a>
                    </div>
                `);
                return;
            }

            // Sort orders by date, newest first
            const orders = data.transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            let html = '';
            orders.forEach(order => {
                let total = 0;
                order.items.forEach(item => total += Number(item.price) * item.quantity);
                
                html += `
                    <div class="card order-card shadow-sm">
                        <div class="card-header bg-white">
                            <div class="row align-items-center">
                                <div class="col-md-3 col-6">
                                    <small class="text-muted">Order Date</small>
                                    <div>${formatDate(order.created_at)}</div>
                                </div>
                                <div class="col-md-3 col-6">
                                    <small class="text-muted">Total</small>
                                    <div class="fw-bold">${formatCurrency(total)}</div>
                                </div>
                                <div class="col-md-3 col-6 mt-3 mt-md-0">
                                    <small class="text-muted">Status</small>
                                    <div>${getStatusBadge(order.status)}</div>
                                </div>
                                <div class="col-md-3 col-6 mt-3 mt-md-0 text-md-end">
                                    <button class="btn btn-primary btn-sm" onclick='showOrderDetails(${JSON.stringify(order)})'>
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                ${order.items.map(item => `
                                    <div class="col-md-6 mb-3">
                                        <div class="d-flex align-items-center">
                                            <img src="${formatImagePath(item.image)}" 
                                                 class="item-image me-3" alt="${item.name}">
                                            <div>
                                                <h6 class="mb-1">${item.name}</h6>
                                                <small class="text-muted">Qty: ${item.quantity}</small>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `;
            });
            
            $('#orders-container').html(html);
        },
        error: function(xhr) {
            let msg = 'Failed to load orders';
            if (xhr.responseJSON && xhr.responseJSON.error) {
                msg = xhr.responseJSON.error;
            }
            $('#orders-container').html(`
                <div class="text-center py-5">
                    <div class="display-1 text-danger mb-4">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <h3 class="text-danger mb-3">Error Loading Orders</h3>
                    <p class="text-muted mb-4">${msg}</p>
                    <button class="btn btn-outline-primary" onclick="location.reload()">
                        <i class="fas fa-redo me-2"></i>Try Again
                    </button>
                </div>
            `);
        }
    });
});
