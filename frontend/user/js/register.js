$(document).ready(function () {
  const API_BASE = window.API_BASE_URL || 'http://localhost:3000/api/v1';
  $('#registerForm').submit(function (e) {
    e.preventDefault();
    const name = $('#name').val().trim();
    const email = $('#email').val().trim();
    const password = $('#password').val();
    // Client-side validation
    let errors = [];
    if (!name) errors.push('Name is required.');
    if (!email) errors.push('Email is required.');
    else if (!/^\S+@\S+\.\S+$/.test(email)) errors.push('Invalid email format.');
    if (!password) errors.push('Password is required.');
    else if (password.length < 6) errors.push('Password must be at least 6 characters.');
    if (errors.length > 0) {
      $('#registerMsg').html('<div class="alert alert-danger">' + errors.join('<br>') + '</div>');
      return;
    }
    $.ajax({
      url: `${API_BASE}/user/register`, // fixed endpoint to match backend
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ name, email, password }),
      success: function (res) {
        $('#registerMsg').html('<div class="alert alert-success">Registration successful! Redirecting to login...</div>');
        setTimeout(() => window.location = 'login.html', 1500);
      },
      error: function (xhr) {
        let msg = xhr.responseJSON?.message || xhr.responseJSON?.error || 'Registration failed';
        $('#registerMsg').html('<div class="alert alert-danger">' + msg + '</div>');
      }
    });
  });
});
