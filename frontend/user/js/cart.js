window.cartJsLoaded = true;
$(document).ready(function () {
  const API_BASE = window.API_BASE_URL || 'http://localhost:3000/api/v1';
  // Debug: Show token in console
  const token = localStorage.getItem('token');
  console.log('JWT token in localStorage:', token);
  if (!token) {
    $('#cartTable').html('<div class="alert alert-warning text-center">You must <a href="login.html">log in</a> to view your cart.</div>');
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
      let msg = 'Failed to load cart from server.';
      if (xhr.responseJSON && xhr.responseJSON.error) {
        msg += '<br><small>' + xhr.responseJSON.error + '</small>';
      }
      $('#cartTable').html('<div class="alert alert-danger text-center">' + msg + '</div>');
      $('#checkoutBtn').prop('disabled', true);
      console.error('Cart fetch error:', xhr);
    }
  });
  function renderCart(cart) {
    if (!cart || cart.length === 0) {
      $('#cartTable').html('<div class="alert alert-info text-center">Your cart is empty.</div>');
      $('#checkoutBtn').prop('disabled', true);
      return;
    }
    let total = 0;
    let table = `<div class="table-responsive"><table class="table table-bordered table-hover bg-white">
      <thead class="thead-dark">
        <tr>
          <th>Image</th>
          <th>Product</th>
          <th>Price</th>
          <th>Quantity</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>`;
    cart.forEach((item, idx) => {
      let price = Number(item.price); // Ensure price is a number
      let subtotal = price * item.quantity;
      total += subtotal;
      table += `<tr>
        <td><img src="${item.image ? '/' + item.image : 'images/no-image.png'}" style="height:48px;width:48px;object-fit:cover;"></td>
        <td>${item.name}</td>
        <td>₱ ${price.toFixed(2)}</td>
        <td>${item.quantity}</td>
        <td>₱ ${(subtotal).toFixed(2)}</td>
      </tr>`;
    });
    table += `</tbody></table></div>`;
    table += `<div class="text-right font-weight-bold h5">Total: ₱ ${total.toFixed(2)}</div>`;
    $('#cartTable').html(table);
    $('#checkoutBtn').prop('disabled', false);
  }
});
