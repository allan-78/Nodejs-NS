window.cartJsLoaded = true;

// Format image path to ensure correct URL structure
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

// Format currency with commas
function formatCurrency(amount) {
    return '₱' + Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

$(document).ready(function () {
    const API_BASE = window.API_BASE || window.API_BASE_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');

    if (!token) {
        $('#cartTable').html(`
            <div class="card-body text-center py-5">
                <div class="display-1 text-muted mb-4">
                    <i class="fas fa-user-lock"></i>
                </div>
                <h3 class="text-muted mb-3">Please Log In</h3>
                <p class="text-muted mb-4">You must be logged in to view your cart</p>
                <a href="login.html" class="btn btn-primary btn-lg px-4">
                    <i class="fas fa-sign-in-alt me-2"></i>Log In
                </a>
            </div>
        `);
        $('#checkoutBtn').prop('disabled', true);
        return;
    }

    // Fetch cart from backend
    $.ajax({
        url: `${API_BASE}/cart/items`,
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token },
        success: function (res) {
            renderCart(res.items || []);
        },
        error: function (xhr) {
            let msg = 'Failed to load cart';
            if (xhr.responseJSON && xhr.responseJSON.error) {
                msg += `<br><small class="text-muted">${xhr.responseJSON.error}</small>`;
            }
            $('#cartTable').html(`
                <div class="card-body text-center py-5">
                    <div class="display-1 text-danger mb-4">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <h3 class="text-danger mb-3">Error Loading Cart</h3>
                    <p class="text-muted mb-4">${msg}</p>
                    <button class="btn btn-outline-primary" onclick="location.reload()">
                        <i class="fas fa-redo me-2"></i>Try Again
                    </button>
                </div>
            `);
            $('#checkoutBtn').prop('disabled', true);
            console.error('Cart fetch error:', xhr);
        }
    });

    function renderCart(cart) {
        if (!cart || cart.length === 0) {
            $('#cartTable').html(`
                <div class="card-body text-center py-5">
                    <div class="display-1 text-muted mb-4">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <h3 class="text-muted mb-3">Your Cart is Empty</h3>
                    <p class="text-muted mb-4">Add some items to your cart and they will appear here</p>
                    <a href="home.html" class="btn btn-primary btn-lg px-4">
                        <i class="fas fa-shopping-bag me-2"></i>Start Shopping
                    </a>
                </div>
            `);
            $('#cartSummary').html('');
            $('#checkoutBtn').prop('disabled', true);
            return;
        }

        let total = 0;
        let itemsHtml = `
            <div class="card-body">
                <h5 class="card-title mb-4">Cart Items (${cart.length})</h5>
        `;

        cart.forEach((item, idx) => {
            let price = Number(item.price);
            let subtotal = price * item.quantity;
            total += subtotal;

            itemsHtml += `
                <div class="cart-item card mb-3 border">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-lg-2 col-3">
                                <img src="${item.image ? formatImagePath(item.image) : '/images/no-image.png'}" 
                                     class="product-image" alt="${item.name}">
                            </div>
                            <div class="col-lg-4 col-9">
                                <h6 class="card-title mb-1">${item.name}</h6>
                                <div class="text-muted small">Item #${item.id}</div>
                            </div>
                            <div class="col-lg-2 col-4 mt-3 mt-lg-0">
                                <span class="quantity-badge">
                                    <i class="fas fa-times me-1"></i>${item.quantity}
                                </span>
                            </div>
                            <div class="col-lg-2 col-4 mt-3 mt-lg-0 text-lg-center">
                                <div class="text-muted small">Price</div>
                                <div>${formatCurrency(price)}</div>
                            </div>
                            <div class="col-lg-2 col-4 mt-3 mt-lg-0 text-lg-end">
                                <div class="text-muted small">Subtotal</div>
                                <div class="fw-bold">${formatCurrency(subtotal)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        itemsHtml += `</div>`;
        $('#cartTable').html(itemsHtml);

        // Render cart summary
        const summaryHtml = `
            <div class="mb-3">
                <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">Subtotal</span>
                    <span>${formatCurrency(total)}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">Shipping</span>
                    <span class="text-success">Free</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">Taxes</span>
                    <span>₱0.00</span>
                </div>
            </div>
            <div class="d-flex justify-content-between mb-2 pt-3 border-top">
                <span class="h5">Total</span>
                <span class="h5 text-primary">${formatCurrency(total)}</span>
            </div>
        `;
        $('#cartSummary').html(summaryHtml);
        $('#checkoutBtn').prop('disabled', false);
    }
});
