// Use existing API_BASE or create it if it doesn't exist
window.API_BASE = window.API_BASE || window.API_BASE_URL || 'http://localhost:3000/api/v1';

// checkout.js: Handles displaying cart as receipt and performing checkout

function updateProgress(step) {
    document.querySelectorAll('.progress-step').forEach((el, index) => {
        if (index < step) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

function formatCurrency(amount) {
    return '₱' + Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

document.addEventListener('DOMContentLoaded', () => {
    // Start at step 1
    updateProgress(1);

    // Fetch cart items for receipt
    const token = localStorage.getItem('token');
    if (!token) {
        document.getElementById('checkout-message').innerHTML = '<div class="alert alert-danger">You must be logged in to checkout.</div>';
        document.getElementById('checkout-btn').style.display = 'none';
        return;
    }
    fetch(`${API_BASE}/cart/items`, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => {
        if (!res.ok) throw new Error('Failed to fetch cart items: ' + res.status);
        return res.json();
    })
    .then(data => {
        if (!data.items || !data.items.length) {
            document.getElementById('receipt-section').innerHTML = '<div class="alert alert-warning">Your cart is empty.</div>';
            document.getElementById('checkout-btn').style.display = 'none';
            return;
        }
        let total = 0;
        let itemsHtml = '';
        let summaryHtml = '<ul class="list-unstyled mb-4">';

        data.items.forEach(item => {
            const subtotal = Number(item.price) * item.quantity;
            total += subtotal;
            
            // Add to items section
            itemsHtml += `
                <div class="card item-card mb-3 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-2 col-3">
                                <div class="bg-light rounded p-3 text-center">
                                    <i class="fas fa-box fa-2x text-muted"></i>
                                </div>
                            </div>
                            <div class="col-md-6 col-9">
                                <h5 class="card-title mb-0">${item.name}</h5>
                                <p class="card-text text-muted mb-0">Qty: ${item.quantity}</p>
                            </div>
                            <div class="col-md-4 col-12 text-md-end mt-3 mt-md-0">
                                <div class="text-muted mb-1">Price: ${formatCurrency(item.price)}</div>
                                <div class="fw-bold">Total: ${formatCurrency(subtotal)}</div>
                            </div>
                        </div>
                    </div>
                </div>`;

            // Add to summary section
            summaryHtml += `
                <li class="d-flex justify-content-between mb-2">
                    <span>${item.name} × ${item.quantity}</span>
                    <span>${formatCurrency(subtotal)}</span>
                </li>`;
        });

        // Complete the summary section
        summaryHtml += `
            <li class="border-top pt-3 mt-3">
                <div class="d-flex justify-content-between mb-2">
                    <span>Subtotal</span>
                    <span>${formatCurrency(total)}</span>
                </div>
                <div class="d-flex justify-content-between mb-2 text-muted">
                    <span>Shipping</span>
                    <span>Free</span>
                </div>
                <div class="d-flex justify-content-between mt-3 pt-3 border-top fw-bold fs-5">
                    <span>Total</span>
                    <span class="text-primary">${formatCurrency(total)}</span>
                </div>
            </li>
        </ul>`;

        // Update the DOM
        document.getElementById('receipt-section').innerHTML = itemsHtml;
        document.getElementById('summary-section').innerHTML = summaryHtml;
    })
    .catch(err => {
        document.getElementById('checkout-message').innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
        document.getElementById('checkout-btn').style.display = 'none';
    });

    // Handle checkout
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            checkoutBtn.disabled = true;
            document.getElementById('checkout-message').innerHTML = 'Processing...';
            fetch(`${API_BASE}/cart/checkout`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                }
            })
            .then(async res => {
                let text = await res.text();
                let data;
                try { data = JSON.parse(text); } catch { data = { error: text }; }
                if (res.ok && data.success) {
                    // Update progress to step 3 (Complete)
                    updateProgress(3);
                    
                    document.getElementById('checkout-message').innerHTML = `
                        <div class="alert alert-success">
                            <i class="fas fa-check-circle me-2"></i>
                            Order placed successfully!
                            <div class="small mt-2">Transaction ID: ${data.transaction_id}</div>
                            <div class="small">A receipt has been sent to your email.</div>
                        </div>`;

                    // Fetch and display the transaction receipt
                    fetch(`${API_BASE}/transaction/${data.transaction_id}`, {
                        headers: { 'Authorization': 'Bearer ' + token }
                    })
                    .then(r => r.json())
                    .then(receiptData => {
                        if (receiptData.transaction) {
                            const t = receiptData.transaction;
                            let html = `
                                <div class="card border-0 shadow-sm">
                                    <div class="card-body">
                                        <div class="text-center mb-4">
                                            <div class="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 80px; height: 80px">
                                                <i class="fas fa-check-circle fa-3x"></i>
                                            </div>
                                            <h3 class="mt-3">Order Confirmed!</h3>
                                            <p class="text-muted">Your order has been processed successfully.</p>
                                        </div>
                                        
                                        <div class="row g-3 mb-4">
                                            <div class="col-md-6">
                                                <div class="border rounded p-3">
                                                    <h6 class="text-muted mb-2">Order Date</h6>
                                                    <div>${new Date(t.created_at).toLocaleString()}</div>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="border rounded p-3">
                                                    <h6 class="text-muted mb-2">Order Status</h6>
                                                    <div class="text-success">
                                                        <i class="fas fa-check-circle me-1"></i>
                                                        ${t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <h5 class="mb-3">Order Items</h5>`;
                            
                            let total = 0;
                            t.items.forEach(item => {
                                const subtotal = Number(item.price) * item.quantity;
                                total += subtotal;
                                html += `
                                    <div class="card mb-3 border">
                                        <div class="card-body">
                                            <div class="row align-items-center">
                                                <div class="col-md-2 col-3">
                                                    <div class="bg-light rounded p-3 text-center">
                                                        <i class="fas fa-box text-muted"></i>
                                                    </div>
                                                </div>
                                                <div class="col-md-6 col-9">
                                                    <h6 class="mb-0">${item.name}</h6>
                                                    <small class="text-muted">Qty: ${item.quantity}</small>
                                                </div>
                                                <div class="col-md-4 col-12 text-md-end mt-3 mt-md-0">
                                                    <div class="text-muted small">Price: ${formatCurrency(item.price)}</div>
                                                    <div>Total: ${formatCurrency(subtotal)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>`;
                            });

                            html += `
                                <div class="card border mt-4">
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col-md-6">
                                                <h6 class="text-muted mb-3">Payment Details</h6>
                                                <p class="mb-1">Total Amount: ${formatCurrency(total)}</p>
                                                <p class="mb-1">Payment Method: Cash on Delivery</p>
                                            </div>
                                            <div class="col-md-6 text-md-end">
                                                <a href="orders.html" class="btn btn-primary mt-3">
                                                    <i class="fas fa-shopping-bag me-2"></i>View Orders
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                            
                            document.getElementById('receipt-section').innerHTML = html;
                        } else {
                            document.getElementById('receipt-section').innerHTML = '<div class="alert alert-warning">Could not load receipt details.</div>';
                        }
                    })
                    .catch(() => {
                        document.getElementById('receipt-section').innerHTML = '<div class="alert alert-warning">Could not load receipt details.</div>';
                    });
                    checkoutBtn.style.display = 'none';
                } else {
                    document.getElementById('checkout-message').innerHTML = `<div class="alert alert-danger">${data.error || 'Checkout failed.'}</div>`;
                    checkoutBtn.disabled = false;
                }
            })
            .catch(err => {
                document.getElementById('checkout-message').innerHTML = `<div class="alert alert-danger">${err.message || 'Checkout failed. Please try again.'}</div>`;
                checkoutBtn.disabled = false;
            });
        });
    }
});
