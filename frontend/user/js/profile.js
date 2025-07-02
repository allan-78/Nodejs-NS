// profile.js: Handles user profile info and orders

const API_BASE = window.API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:3000/api/v1`;

function getAuthHeader() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location = 'login.html';
        return {};
    }
    return { Authorization: 'Bearer ' + token };
}

function getUserId() {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
        window.location = 'login.html';
        return null;
    }
    return userId;
}

$(document).ready(function () {
    // Load navbar
    $("#navbar").load("navbar.html");


    // Fetch user info and set profile photo
    function loadProfileInfo() {
        $.ajax({
            url: `${API_BASE}/user/profile`,
            method: 'GET',
            headers: getAuthHeader(),
            success: function (data) {
                if (data.user) {
                    $('#profile-info').html(`
                        <div><b>Name:</b> ${data.user.name}</div>
                        <div><b>Email:</b> ${data.user.email}</div>
                    `);
                    $('#edit-name').val(data.user.name);
                    $('#edit-email').val(data.user.email);
                    // Set profile photo if available
                    if (data.user.profile_photo_path) {
                        // Always use absolute path for image src
                        const absPath = data.user.profile_photo_path.startsWith('/')
                            ? data.user.profile_photo_path
                            : '/' + data.user.profile_photo_path;
                        const img = new Image();
                        img.onload = function() {
                            $('#profile-photo').attr('src', absPath);
                        };
                        img.onerror = function() {
                            $('#profile-photo').attr('src', '/images/default-avatar.png');
                        };
                        img.src = absPath;
                    } else {
                        $('#profile-photo').attr('src', '/images/default-avatar.png');
                    }
                    // Show/hide deactivate button based on is_active
                    if (data.user.is_active === 1 || data.user.is_active === true || data.user.is_active === '1') {
                        $('#deactivateAccountBtn').show();
                    } else {
                        $('#deactivateAccountBtn').hide();
                    }
                }
    // Deactivate Account handler
    $(document).on('click', '#deactivateAccountBtn', function () {
        if (!confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) return;
        $.ajax({
            url: `${API_BASE}/user/deactivate`,
            method: 'POST',
            headers: getAuthHeader(),
            success: function (data) {
                alert('Your account has been deactivated. You will be logged out.');
                localStorage.removeItem('token');
                localStorage.removeItem('user_id');
                window.location.href = 'login.html';
            },
            error: function (xhr) {
                let msg = 'Failed to deactivate account.';
                if (xhr.responseJSON && xhr.responseJSON.error) msg += ' ' + xhr.responseJSON.error;
                alert(msg);
            }
        });
    });
            },
            error: function () {
                $('#profile-info').html('<div class="alert alert-danger">Failed to load profile info.</div>');
            }
        });
    }
    loadProfileInfo();

    // Profile photo click handler
    $(document).on('click', '#profile-photo', function () {
        $('#profile-photo-input').click();
    });

    // Profile photo file input change handler
    $(document).on('change', '#profile-photo-input', function (e) {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('profile_photo', file);
        $('#profile-photo-message').text('Uploading...').removeClass('text-success text-danger').addClass('text-info');
        $.ajax({
            url: `${API_BASE}/user/profile-photo`,
            method: 'POST',
            headers: getAuthHeader(),
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                if (data.success && data.profile_photo_path) {
                    $('#profile-photo').attr('src', data.profile_photo_path);
                    $('#profile-photo-message').text('Profile photo updated!').removeClass('text-info text-danger').addClass('text-success');
                } else {
                    $('#profile-photo-message').text('Failed to update photo.').removeClass('text-info text-success').addClass('text-danger');
                }
            },
            error: function (xhr) {
                let msg = 'Failed to upload photo.';
                if (xhr.responseJSON && xhr.responseJSON.error) msg = xhr.responseJSON.error;
                $('#profile-photo-message').text(msg).removeClass('text-info text-success').addClass('text-danger');
            }
        });
    });


    // Fetch user orders
    function loadOrders() {
        $.ajax({
            url: `${API_BASE}/orders?user_id=${getUserId()}`,
            method: 'GET',
            headers: getAuthHeader(),
            success: function (data) {
                if (data.orders && data.orders.length) {
                    let html = '<ul class="list-group">';
                    data.orders.forEach(order => {
                        html += `<li class="list-group-item">
                            <div><b>Order #${order.id}</b> - <span class="badge badge-${order.status === 'completed' ? 'success' : 'warning'}">${order.status}</span></div>
                            <div><b>Date:</b> ${new Date(order.created_at).toLocaleString()}</div>
                            <div><b>Total:</b> \u20b1${Number(order.total_price).toFixed(2)}</div>
                            <div><b>Items:</b> ${order.items.map(i => i.name + ' (x' + i.quantity + ')').join(', ')}</div>`;
                        if (order.status === 'completed') {
                            html += `<div class=\"mt-2\"><b>Review:</b> ${order.items.map(i => {
                                if (i.reviewed) {
                                    return `<span class='badge badge-success ml-1'>Reviewed</span>`;
                                } else {
                                    return `<button class='btn btn-sm btn-outline-primary review-order-btn' data-product-id='${i.product_id}' data-product-name='${i.name}'>Review ${i.name}</button>`;
                                }
                            }).join(' ')}</div>`;
                        }
                        html += `</li>`;
                    });
                    html += '</ul>';
                    $('#orders-list').html(html);
                } else {
                    $('#orders-list').html('<div class="alert alert-info">No orders found.</div>');
                }
            },
            error: function () {
                $('#orders-list').html('<div class="alert alert-danger">Failed to load orders.</div>');
            }
        });
    }

    loadOrders();

    // Fetch user reviews and unreviewed products together
    function loadReviewsAndUnreviewed() {
        // Fetch reviews
        $.ajax({
            url: `${API_BASE}/user/reviews?user_id=${getUserId()}`,
            method: 'GET',
            headers: getAuthHeader(),
            success: function (data) {
                let html = '';
                if (data.reviews && data.reviews.length) {
                    data.reviews.forEach(r => {
                        html += `<div class="card review-card mb-3 border-0 shadow-sm" data-review-id="${r.id}">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <div class="font-weight-bold text-primary">${r.product_name}</div>
                                    <div class="text-warning" style="font-size:1.2em;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
                                </div>
                                <div class="mb-2">${r.comment}</div>
                                <div class="text-muted small mb-2">${new Date(r.created_at).toLocaleString()}</div>
                                <div class="mt-2 d-flex gap-2">
                                    <button class="btn btn-sm btn-outline-secondary edit-review-btn mr-2" data-review-id="${r.id}" data-product-name="${r.product_name}" data-rating="${r.rating}" data-comment="${encodeURIComponent(r.comment)}">Edit</button>
                                    <button class="btn btn-sm btn-outline-danger delete-review-btn" data-review-id="${r.id}">Delete</button>
                                </div>
                            </div>
                        </div>`;
                    });
                }
                // Now fetch unreviewed products and append
                $.ajax({
                    url: `${API_BASE}/user/unreviewed-products?user_id=${getUserId()}`,
                    method: 'GET',
                    headers: getAuthHeader(),
                    success: function (data2) {
                        if (data2.products && data2.products.length) {
                            html += '<h6 class="mb-2 mt-4">Products you can review:</h6>';
                            data2.products.forEach(p => {
                                html += `<div class="card mb-2 border-0 shadow-sm"><div class="card-body d-flex justify-content-between align-items-center">
                                    <div class="font-weight-bold text-primary">${p.name}</div>
                                    <button class="btn btn-sm btn-success review-now-btn" data-product-id="${p.id}">Review Now</button>
                            </div></div>`;
                            });
                        }
                        if (!html) {
                            html = '<div class="alert alert-info">You have not reviewed any products yet.<br><button class="btn btn-outline-primary mt-2" id="show-unreviewed-btn">Review Your Products</button></div>';
                        }
                        $('#my-reviews-list').html(html);
                    },
                    error: function () {
                        $('#my-reviews-list').html('<div class="alert alert-danger">Failed to load unreviewed products.</div>');
                    }
                });
            },
            error: function () {
                $('#my-reviews-list').html('<div class="alert alert-danger">Failed to load your reviews.</div>');
            }
        });
    }

    loadReviewsAndUnreviewed();

    // Edit Profile Modal
    $('#editProfileBtn').on('click', function () {
        $('#editProfileModal').modal('show');
    });
    $('#edit-profile-form').on('submit', function (e) {
        e.preventDefault();
        const name = $('#edit-name').val();
        const email = $('#edit-email').val();
        $.ajax({
            url: `${API_BASE}/user/profile`,
            method: 'PUT',
            headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
            data: JSON.stringify({ name, email }),
            success: function (res) {
                $('#edit-profile-message').html('<div class="alert alert-success">Profile updated!</div>');
                if (res.user && res.user.profile_photo_path) {
                    $('#profile-photo').attr('src', res.user.profile_photo_path);
                }
                setTimeout(() => { location.reload(); }, 1000);
            },
            error: function (xhr) {
                let msg = 'Failed to update profile.';
                if (xhr.responseJSON && xhr.responseJSON.error) msg += ' ' + xhr.responseJSON.error;
                $('#edit-profile-message').html('<div class="alert alert-danger">' + msg + '</div>');
            }
        });
    });

    // Change Password Modal
    $('#changePasswordBtn').on('click', function () {
        $('#changePasswordModal').modal('show');
    });
    $('#change-password-form').on('submit', function (e) {
        e.preventDefault();
        const current = $('#current-password').val();
        const newpass = $('#new-password').val();
        $.ajax({
            url: `${API_BASE}/user/password`,
            method: 'PUT',
            headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
            data: JSON.stringify({ current_password: current, new_password: newpass }),
            success: function () {
                $('#change-password-message').html('<div class="alert alert-success">Password changed!</div>');
                $('#change-password-form')[0].reset();
                setTimeout(() => { $('#changePasswordModal').modal('hide'); }, 1000);
            },
            error: function (xhr) {
                let msg = 'Failed to change password.';
                if (xhr.responseJSON && xhr.responseJSON.error) msg += ' ' + xhr.responseJSON.error;
                $('#change-password-message').html('<div class="alert alert-danger">' + msg + '</div>');
            }
        });
    });

    // Toggle order history visibility
    $(document).on('click', '#toggle-orders-btn', function () {
        const $orders = $('#orders-list');
        if ($orders.is(':visible')) {
            $orders.slideUp();
            $(this).text('Show Orders');
        } else {
            $orders.slideDown();
            $(this).text('Hide Orders');
        }
    });

    // Toggle product reviews visibility
    $(document).on('click', '#toggle-reviews-btn', function () {
        const $reviews = $('#my-reviews-list');
        if ($reviews.is(':visible')) {
            $reviews.slideUp();
            $(this).text('Show Reviews');
        } else {
            $reviews.slideDown();
            $(this).text('Hide Reviews');
        }
    });

    // Handle review button click in order history
    $(document).on('click', '.review-order-btn', function () {
        const productId = $(this).data('product-id');
        const productName = $(this).data('product-name');
        // Show a simple modal for review
        const modalHtml = `
        <div class="modal fade" id="orderReviewModal" tabindex="-1" role="dialog" aria-labelledby="orderReviewModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Review: ${productName}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <form id="order-review-form">
                  <div class="form-group">
                    <label for="order-review-rating">Rating</label>
                    <select id="order-review-rating" class="form-control" required>
                      <option value="">Select</option>
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Good</option>
                      <option value="3">3 - Average</option>
                      <option value="2">2 - Poor</option>
                      <option value="1">1 - Terrible</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="order-review-comment">Comment</label>
                    <textarea id="order-review-comment" class="form-control" rows="3" required></textarea>
                  </div>
                  <button type="submit" class="btn btn-primary">Submit Review</button>
                  <div id="order-review-message" class="mt-2"></div>
                </form>
              </div>
            </div>
          </div>
        </div>`;
        // Remove any existing modal and append new
        $('#orderReviewModal').remove();
        $('body').append(modalHtml);
        $('#orderReviewModal').modal('show');
        // Handle review form submit
        $('#order-review-form').on('submit', function (e) {
            e.preventDefault();
            const rating = $('#order-review-rating').val();
            const comment = $('#order-review-comment').val();
            console.log('Submitting review:', { productId, rating, comment });
            if (!rating || !comment) return;
            $.ajax({
                url: `${API_BASE}/product/${productId}/reviews`,
                method: 'POST',
                headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
                data: JSON.stringify({ rating, comment }),
                success: function () {
                    $('#order-review-message').html('<div class="alert alert-success">Review submitted!</div>');
                    setTimeout(() => { $('#orderReviewModal').modal('hide'); loadOrders(); }, 1000);
                },
                error: function (xhr) {
                    let msg = 'Failed to submit review.';
                    if (xhr.responseJSON && xhr.responseJSON.error) msg += ' ' + xhr.responseJSON.error;
                    console.error('Review submit error:', xhr, xhr.responseText);
                    $('#order-review-message').html('<div class="alert alert-danger">' + msg + '</div>');
                }
            });
        });
    });

    // Handle review button click for unreviewed products
    $(document).off('click', '.review-now-btn').on('click', '.review-now-btn', function () {
        const productId = $(this).attr('data-product-id');
        const productName = $(this).closest('.card-body').find('b').text() || 'Product';
        // Remove any existing modal and append new
        $('#orderReviewModal').remove();
        const modalHtml = `
        <div class="modal fade" id="orderReviewModal" tabindex="-1" role="dialog" aria-labelledby="orderReviewModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Review: ${productName}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <form id="order-review-form">
                  <div class="form-group">
                    <label for="order-review-rating">Rating</label>
                    <select id="order-review-rating" class="form-control" required>
                      <option value="">Select</option>
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Good</option>
                      <option value="3">3 - Average</option>
                      <option value="2">2 - Poor</option>
                      <option value="1">1 - Terrible</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="order-review-comment">Comment</label>
                    <textarea id="order-review-comment" class="form-control" rows="3" required></textarea>
                  </div>
                  <button type="submit" class="btn btn-primary">Submit Review</button>
                  <div id="order-review-message" class="mt-2"></div>
                </form>
              </div>
            </div>
          </div>
        </div>`;
        $('body').append(modalHtml);
        $('#orderReviewModal').modal('show');
        // Remove modal from DOM after hiding
        $('#orderReviewModal').on('hidden.bs.modal', function () { $(this).remove(); });
        // Attach submit handler ONCE
        $('#order-review-form').off('submit').on('submit', function (e) {
            e.preventDefault();
            const rating = $('#order-review-rating').val();
            const comment = $('#order-review-comment').val();
            if (!rating || !comment) {
                $('#order-review-message').html('<div class="alert alert-danger">Please provide both rating and comment.</div>');
                return;
            }
            $.ajax({
                url: `${API_BASE}/product/${productId}/reviews`,
                method: 'POST',
                headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
                data: JSON.stringify({ rating, comment }),
                success: function () {
                    $('#order-review-message').html('<div class="alert alert-success">Review submitted!</div>');
                    setTimeout(() => { $('#orderReviewModal').modal('hide'); loadReviewsAndUnreviewed(); }, 1000);
                },
                error: function (xhr) {
                    let msg = 'Failed to submit review.';
                    if (xhr.responseJSON && xhr.responseJSON.error) msg += ' ' + xhr.responseJSON.error;
                    $('#order-review-message').html('<div class="alert alert-danger">' + msg + '</div>');
                }
            });
        });
    });

    // Edit Profile Modal
    $('#editProfileBtn').on('click', function () {
        $('#editProfileModal').modal('show');
    });
    $('#edit-profile-form').on('submit', function (e) {
        e.preventDefault();
        const name = $('#edit-name').val();
        const email = $('#edit-email').val();
        $.ajax({
            url: `${API_BASE}/user/profile`,
            method: 'PUT',
            headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
            data: JSON.stringify({ name, email }),
            success: function () {
                $('#edit-profile-message').html('<div class="alert alert-success">Profile updated!</div>');
                setTimeout(() => { location.reload(); }, 1000);
            },
            error: function (xhr) {
                let msg = 'Failed to update profile.';
                if (xhr.responseJSON && xhr.responseJSON.error) msg += ' ' + xhr.responseJSON.error;
                $('#edit-profile-message').html('<div class="alert alert-danger">' + msg + '</div>');
            }
        });
    });

    // Change Password Modal
    $('#changePasswordBtn').on('click', function () {
        $('#changePasswordModal').modal('show');
    });
    $('#change-password-form').on('submit', function (e) {
        e.preventDefault();
        const current = $('#current-password').val();
        const newpass = $('#new-password').val();
        $.ajax({
            url: `${API_BASE}/user/password`,
            method: 'PUT',
            headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
            data: JSON.stringify({ current_password: current, new_password: newpass }),
            success: function () {
                $('#change-password-message').html('<div class="alert alert-success">Password changed!</div>');
                $('#change-password-form')[0].reset();
                setTimeout(() => { $('#changePasswordModal').modal('hide'); }, 1000);
            },
            error: function (xhr) {
                let msg = 'Failed to change password.';
                if (xhr.responseJSON && xhr.responseJSON.error) msg += ' ' + xhr.responseJSON.error;
                $('#change-password-message').html('<div class="alert alert-danger">' + msg + '</div>');
            }
        });
    });

    // Toggle order history visibility
    $(document).on('click', '#toggle-orders-btn', function () {
        const $orders = $('#orders-list');
        if ($orders.is(':visible')) {
            $orders.slideUp();
            $(this).text('Show Orders');
        } else {
            $orders.slideDown();
            $(this).text('Hide Orders');
        }
    });

    // Toggle product reviews visibility
    $(document).on('click', '#toggle-reviews-btn', function () {
        const $reviews = $('#my-reviews-list');
        if ($reviews.is(':visible')) {
            $reviews.slideUp();
            $(this).text('Show Reviews');
        } else {
            $reviews.slideDown();
            $(this).text('Hide Reviews');
        }
    });

    // Handle review button click in order history
    $(document).on('click', '.review-order-btn', function () {
        const productId = $(this).data('product-id');
        const productName = $(this).data('product-name');
        // Show a simple modal for review
        const modalHtml = `
        <div class="modal fade" id="orderReviewModal" tabindex="-1" role="dialog" aria-labelledby="orderReviewModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Review: ${productName}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <form id="order-review-form">
                  <div class="form-group">
                    <label for="order-review-rating">Rating</label>
                    <select id="order-review-rating" class="form-control" required>
                      <option value="">Select</option>
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Good</option>
                      <option value="3">3 - Average</option>
                      <option value="2">2 - Poor</option>
                      <option value="1">1 - Terrible</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="order-review-comment">Comment</label>
                    <textarea id="order-review-comment" class="form-control" rows="3" required></textarea>
                  </div>
                  <button type="submit" class="btn btn-primary">Submit Review</button>
                  <div id="order-review-message" class="mt-2"></div>
                </form>
              </div>
            </div>
          </div>
        </div>`;
        // Remove any existing modal and append new
        $('#orderReviewModal').remove();
        $('body').append(modalHtml);
        $('#orderReviewModal').modal('show');
        // Handle review form submit
        $('#order-review-form').on('submit', function (e) {
            e.preventDefault();
            const rating = $('#order-review-rating').val();
            const comment = $('#order-review-comment').val();
            console.log('Submitting review:', { productId, rating, comment });
            if (!rating || !comment) return;
            $.ajax({
                url: `${API_BASE}/product/${productId}/reviews`,
                method: 'POST',
                headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
                data: JSON.stringify({ rating, comment }),
                success: function () {
                    $('#order-review-message').html('<div class="alert alert-success">Review submitted!</div>');
                    setTimeout(() => { $('#orderReviewModal').modal('hide'); loadOrders(); }, 1000);
                },
                error: function (xhr) {
                    let msg = 'Failed to submit review.';
                    if (xhr.responseJSON && xhr.responseJSON.error) msg += ' ' + xhr.responseJSON.error;
                    console.error('Review submit error:', xhr, xhr.responseText);
                    $('#order-review-message').html('<div class="alert alert-danger">' + msg + '</div>');
                }
            });
        });
    });

    // Handle review button click for unreviewed products
    $(document).off('click', '.review-now-btn').on('click', '.review-now-btn', function () {
        const productId = $(this).attr('data-product-id');
        const productName = $(this).closest('.card-body').find('b').text() || 'Product';
        // Remove any existing modal and append new
        $('#orderReviewModal').remove();
        const modalHtml = `
        <div class="modal fade" id="orderReviewModal" tabindex="-1" role="dialog" aria-labelledby="orderReviewModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Review: ${productName}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <form id="order-review-form">
                  <div class="form-group">
                    <label for="order-review-rating">Rating</label>
                    <select id="order-review-rating" class="form-control" required>
                      <option value="">Select</option>
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Good</option>
                      <option value="3">3 - Average</option>
                      <option value="2">2 - Poor</option>
                      <option value="1">1 - Terrible</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="order-review-comment">Comment</label>
                    <textarea id="order-review-comment" class="form-control" rows="3" required></textarea>
                  </div>
                  <button type="submit" class="btn btn-primary">Submit Review</button>
                  <div id="order-review-message" class="mt-2"></div>
                </form>
              </div>
            </div>
          </div>
        </div>`;
        $('body').append(modalHtml);
        $('#orderReviewModal').modal('show');
        // Remove modal from DOM after hiding
        $('#orderReviewModal').on('hidden.bs.modal', function () { $(this).remove(); });
        // Attach submit handler ONCE
        $('#order-review-form').off('submit').on('submit', function (e) {
            e.preventDefault();
            const rating = $('#order-review-rating').val();
            const comment = $('#order-review-comment').val();
            if (!rating || !comment) {
                $('#order-review-message').html('<div class="alert alert-danger">Please provide both rating and comment.</div>');
                return;
            }
            $.ajax({
                url: `${API_BASE}/product/${productId}/reviews`,
                method: 'POST',
                headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
                data: JSON.stringify({ rating, comment }),
                success: function () {
                    $('#order-review-message').html('<div class="alert alert-success">Review submitted!</div>');
                    setTimeout(() => { $('#orderReviewModal').modal('hide'); loadReviewsAndUnreviewed(); }, 1000);
                },
                error: function (xhr) {
                    let msg = 'Failed to submit review.';
                    if (xhr.responseJSON && xhr.responseJSON.error) msg += ' ' + xhr.responseJSON.error;
                    $('#order-review-message').html('<div class="alert alert-danger">' + msg + '</div>');
                }
            });
        });
    });

    // Edit Review
    $(document).on('click', '.edit-review-btn', function () {
        const reviewId = $(this).data('review-id');
        const productName = $(this).data('product-name');
        const rating = $(this).data('rating');
        const comment = decodeURIComponent($(this).data('comment'));
        // Show modal for editing
        const modalHtml = `
        <div class="modal fade" id="editReviewModal" tabindex="-1" role="dialog" aria-labelledby="editReviewModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Edit Review: ${productName}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <form id="edit-review-form">
                  <div class="form-group">
                    <label for="edit-review-rating">Rating</label>
                    <select id="edit-review-rating" class="form-control" required>
                      <option value="">Select</option>
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Good</option>
                      <option value="3">3 - Average</option>
                      <option value="2">2 - Poor</option>
                      <option value="1">1 - Terrible</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="edit-review-comment">Comment</label>
                    <textarea id="edit-review-comment" class="form-control" rows="3" required></textarea>
                  </div>
                  <button type="submit" class="btn btn-primary">Save Changes</button>
                  <div id="edit-review-message" class="mt-2"></div>
                </form>
              </div>
            </div>
          </div>
        </div>`;
        $('#editReviewModal').remove();
        $('body').append(modalHtml);
        $('#editReviewModal').modal('show');
        $('#edit-review-rating').val(rating);
        $('#edit-review-comment').val(comment);
        $('#edit-review-form').on('submit', function (e) {
            e.preventDefault();
            const newRating = $('#edit-review-rating').val();
            const newComment = $('#edit-review-comment').val();
            if (!newRating || !newComment) return;
            $.ajax({
                url: `${API_BASE}/review/${reviewId}`,
                method: 'PUT',
                headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
                data: JSON.stringify({ rating: newRating, comment: newComment }),
                success: function () {
                    $('#edit-review-message').html('<div class="alert alert-success">Review updated!</div>');
                    setTimeout(() => { $('#editReviewModal').modal('hide'); location.reload(); }, 1000);
                },
                error: function (xhr) {
                    let msg = 'Failed to update review.';
                    if (xhr.responseJSON && xhr.responseJSON.error) msg += ' ' + xhr.responseJSON.error;
                    $('#edit-review-message').html('<div class="alert alert-danger">' + msg + '</div>');
                }
            });
        });
    });

    // Logout handler
    $(document).on('click', '#logoutBtn', function () {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        // Show logout message on login page
        sessionStorage.setItem('logoutMsg', 'Logged out successfully.');
        window.location.href = 'login.html';
    });

    // Robust delete review handler: after delete, refresh reviews and unreviewed products
    $(document).off('click', '.delete-review-btn').on('click', '.delete-review-btn', function () {
        const reviewId = $(this).data('review-id');
        if (!confirm('Are you sure you want to delete this review?')) return;
        $.ajax({
            url: `${API_BASE}/review/${reviewId}`,
            method: 'DELETE',
            headers: getAuthHeader(),
            success: function () {
                // After delete, reload both reviews and unreviewed products
                loadReviewsAndUnreviewed();
            },
            error: function (xhr) {
                let msg = 'Failed to delete review.';
                if (xhr.responseJSON && xhr.responseJSON.error) msg += ' ' + xhr.responseJSON.error;
                alert(msg);
            }
        });
    });
});
