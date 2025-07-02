$(document).ready(function () {
  // Show logout message if present
  if (sessionStorage.getItem('logoutMsg')) {
    $('#loginMsg').html('<div class="alert alert-success">' + sessionStorage.getItem('logoutMsg') + '</div>');
    sessionStorage.removeItem('logoutMsg');
  }
  const API_BASE = window.API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:3000/api/v1`;
  $('#loginForm').submit(function (e) {
    e.preventDefault();
    const email = $('#email').val().trim();
    const password = $('#password').val();
    let errors = [];
    if (!email) errors.push('Email is required.');
    if (!password) errors.push('Password is required.');
    if (errors.length > 0) {
      $('#loginMsg').html('<div class="alert alert-danger">' + errors.join('<br>') + '</div>');
      return;
    }
    $.ajax({
      url: `${API_BASE}/user/login`,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ email, password }),
      success: function (res) {
        // Save JWT and user_id to localStorage
        localStorage.setItem('token', res.token);
        localStorage.setItem('user_id', res.user.id);
        $('#loginMsg').html('<div class="alert alert-success">Login successful! Redirecting...</div>');
        setTimeout(() => window.location = 'home.html', 1200);
      },
      error: function (xhr) {
        let msg = xhr.responseJSON?.message || xhr.responseJSON?.error || 'Login failed';
        if (msg.toLowerCase().includes('verify')) {
          msg = 'Please verify your email first.';
        }
        $('#loginMsg').html('<div class="alert alert-danger">' + msg + '</div>');
      }
    });
  });
});
