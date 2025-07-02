// Set API base URL for local development
const API_BASE = 'http://localhost:3000/api/v1'; // Changed to match backend port 3000

// checkout.js: Handles displaying cart as receipt and performing checkout

document.addEventListener('DOMContentLoaded', () => {
    // Load navbar
    fetch('navbar.html').then(r => r.text()).then(html => {
        document.getElementById('navbar').innerHTML = html;
    });

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
        let html = `<table class="table"><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead><tbody>`;
        data.items.forEach(item => {
            const subtotal = Number(item.price) * item.quantity;
            total += subtotal;
            html += `<tr><td>${item.name}</td><td>${item.quantity}</td><td>₱${Number(item.price).toFixed(2)}</td><td>₱${subtotal.toFixed(2)}</td></tr>`;
        });
        html += `</tbody><tfoot><tr><th colspan="3">Total</th><th>₱${total.toFixed(2)}</th></tr></tfoot></table>`;
        document.getElementById('receipt-section').innerHTML = html;
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
                    document.getElementById('checkout-message').innerHTML = `<div class="alert alert-success">Checkout successful! Transaction ID: ${data.transaction_id}<br>A receipt has been sent to your email.</div>`;
                    // Fetch and display the transaction receipt
                    fetch(`${API_BASE}/transaction/${data.transaction_id}`, {
                        headers: { 'Authorization': 'Bearer ' + token }
                    })
                    .then(r => r.json())
                    .then(receiptData => {
                        if (receiptData.transaction) {
                            const t = receiptData.transaction;
                            let html = `<h4>Receipt</h4>`;
                            html += `<table class="table"><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead><tbody>`;
                            let total = 0;
                            t.items.forEach(item => {
                                const subtotal = Number(item.price) * item.quantity;
                                total += subtotal;
                                html += `<tr><td>${item.name}</td><td>${item.quantity}</td><td>₱${Number(item.price).toFixed(2)}</td><td>₱${subtotal.toFixed(2)}</td></tr>`;
                            });
                            html += `</tbody><tfoot><tr><th colspan="3">Total</th><th>₱${total.toFixed(2)}</th></tr></tfoot></table>`;
                            html += `<div>Status: <b>${t.status.charAt(0).toUpperCase() + t.status.slice(1)}</b></div>`;
                            html += `<div>Date: ${new Date(t.created_at).toLocaleString()}</div>`;
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
