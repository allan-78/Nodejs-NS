// product.js: Handles product details, reviews, and review submission
const API_BASE = window.API_BASE_URL || 'http://localhost:3000/api/v1';

$(document).ready(function () {
    // Load navbar
    $("#navbar").load("navbar.html");

    // Get product id from URL (?id=123)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (!productId) {
        $('#product-section').html('<div class="alert alert-danger">No product specified.</div>');
        return;
    }

    // Fetch product details (robust avg_rating)
    $.get(`${API_BASE}/product/${productId}`, function (data) {
        if (!data.product) {
            $('#product-section').html('<div class="alert alert-danger">Product not found.</div>');
            return;
        }
        const p = data.product;
        let imagesHtml = '';
        if (p.images && p.images.length) {
            imagesHtml = `<img src="/${p.images[0]}" class="product-img mb-3">`;
        } else {
            imagesHtml = `<img src="/images/no-image.png" class="product-img mb-3">`;
        }
        let avgRating = (typeof p.avg_rating === 'number' || !isNaN(Number(p.avg_rating))) ? Number(p.avg_rating) : null;
        let avgRatingHtml = '';
        if (avgRating !== null) {
            avgRatingHtml = `<span class="text-warning">${'★'.repeat(Math.round(avgRating))}${'☆'.repeat(5 - Math.round(avgRating))}</span> <span class="small text-muted">${avgRating.toFixed(1)} / 5</span>`;
        } else {
            avgRatingHtml = `<span class="text-muted">Not rated yet. Buy this product and rate it!</span>`;
        }
        let cardHtml = `<div class="card product-card shadow">
            <div class="card-body">
                ${imagesHtml}
                <h3 class="card-title">${p.name}</h3>
                <h5 class="text-muted">₱${Number(p.price).toFixed(2)}</h5>
                <p class="card-text">${p.description || ''}</p>
                <div><b>Stock:</b> ${p.stock}</div>
                <div class="mt-2"><b>Average Rating:</b> <span id="avg-rating">${avgRatingHtml}</span></div>
            </div>
        </div>`;
        $('#product-section').html(cardHtml);
    });

    // Fetch and display reviews with edit/delete for own reviews
    function loadReviews() {
        $.get(`${API_BASE}/product/${productId}/reviews`, function (data) {
            const userId = localStorage.getItem('user_id');
            let html = '<h4>Reviews</h4>';
            if (!data.reviews || !data.reviews.length) {
                html += '<div class="alert alert-info">No reviews yet.</div>';
            } else {
                data.reviews.forEach(r => {
                    const isMine = userId && r.user_id && userId == r.user_id;
                    if (isMine && r.editing) {
                        // Inline edit form for this review
                        html += `<div class="card review-card mb-2" data-review-id="${r.id}">
                            <div class="card-body">
                                <form class="edit-review-inline-form">
                                    <div class="form-group mb-2">
                                        <label for="edit-inline-rating-${r.id}" class="mb-0">Rating</label>
                                        <select id="edit-inline-rating-${r.id}" class="form-control form-control-sm" required>
                                            <option value="">Select</option>
                                            <option value="5" ${r.rating==5?'selected':''}>5 - Excellent</option>
                                            <option value="4" ${r.rating==4?'selected':''}>4 - Good</option>
                                            <option value="3" ${r.rating==3?'selected':''}>3 - Average</option>
                                            <option value="2" ${r.rating==2?'selected':''}>2 - Poor</option>
                                            <option value="1" ${r.rating==1?'selected':''}>1 - Terrible</option>
                                        </select>
                                    </div>
                                    <div class="form-group mb-2">
                                        <label for="edit-inline-comment-${r.id}" class="mb-0">Comment</label>
                                        <textarea id="edit-inline-comment-${r.id}" class="form-control form-control-sm" rows="2" required>${r.comment}</textarea>
                                    </div>
                                    <button type="submit" class="btn btn-sm btn-primary">Save</button>
                                    <button type="button" class="btn btn-sm btn-secondary cancel-edit-inline-btn ml-2">Cancel</button>
                                    <div class="edit-inline-message mt-2"></div>
                                </form>
                            </div>
                        </div>`;
                    } else {
                        html += `<div class="card review-card mb-2" data-review-id="${r.id}">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <div><b>${r.user_name || 'Anonymous'}</b></div>
                                    <div class="text-warning">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
                                </div>
                                <div>${r.comment}</div>
                                <div class="text-muted small">${new Date(r.created_at).toLocaleString()}</div>
                                ${isMine ? `<div class="mt-2">
                                    <button class="btn btn-sm btn-outline-secondary edit-review-btn" data-review-id="${r.id}" data-rating="${r.rating}" data-comment="${encodeURIComponent(r.comment)}">Edit</button>
                                    <button class="btn btn-sm btn-outline-danger delete-review-btn" data-review-id="${r.id}">Delete</button>
                                </div>` : ''}
                            </div>
                        </div>`;
                    }
                });
            }
            $('#reviews-section').html(html);
        });
    }
    loadReviews();

    // Handle delete review
    $(document).on('click', '.delete-review-btn', function () {
        const reviewId = $(this).data('review-id');
        if (!confirm('Are you sure you want to delete this review?')) return;
        $.ajax({
            url: `${API_BASE}/review/${reviewId}`,
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
            success: function () {
                $(`.review-card[data-review-id='${reviewId}']`).remove();
            },
            error: function () {
                alert('Failed to delete review.');
            }
        });
    });

    // Inline edit review
    let editingReviewId = null;
    $(document).on('click', '.edit-review-btn', function () {
        editingReviewId = $(this).data('review-id');
        // Reload reviews with editing state
        $.get(`${API_BASE}/product/${productId}/reviews`, function (data) {
            const userId = localStorage.getItem('user_id');
            data.reviews.forEach(r => {
                if (r.id == editingReviewId && userId && r.user_id && userId == r.user_id) {
                    r.editing = true;
                }
            });
            let html = '<h4>Reviews</h4>';
            if (!data.reviews || !data.reviews.length) {
                html += '<div class="alert alert-info">No reviews yet.</div>';
            } else {
                data.reviews.forEach(r => {
                    const isMine = userId && r.user_id && userId == r.user_id;
                    if (isMine && r.editing) {
                        html += `<div class="card review-card mb-2" data-review-id="${r.id}">
                            <div class="card-body">
                                <form class="edit-review-inline-form">
                                    <div class="form-group mb-2">
                                        <label for="edit-inline-rating-${r.id}" class="mb-0">Rating</label>
                                        <select id="edit-inline-rating-${r.id}" class="form-control form-control-sm" required>
                                            <option value="">Select</option>
                                            <option value="5" ${r.rating==5?'selected':''}>5 - Excellent</option>
                                            <option value="4" ${r.rating==4?'selected':''}>4 - Good</option>
                                            <option value="3" ${r.rating==3?'selected':''}>3 - Average</option>
                                            <option value="2" ${r.rating==2?'selected':''}>2 - Poor</option>
                                            <option value="1" ${r.rating==1?'selected':''}>1 - Terrible</option>
                                        </select>
                                    </div>
                                    <div class="form-group mb-2">
                                        <label for="edit-inline-comment-${r.id}" class="mb-0">Comment</label>
                                        <textarea id="edit-inline-comment-${r.id}" class="form-control form-control-sm" rows="2" required>${r.comment}</textarea>
                                    </div>
                                    <button type="submit" class="btn btn-sm btn-primary">Save</button>
                                    <button type="button" class="btn btn-sm btn-secondary cancel-edit-inline-btn ml-2">Cancel</button>
                                    <div class="edit-inline-message mt-2"></div>
                                </form>
                            </div>
                        </div>`;
                    } else {
                        html += `<div class="card review-card mb-2" data-review-id="${r.id}">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <div><b>${r.user_name || 'Anonymous'}</b></div>
                                    <div class="text-warning">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
                                </div>
                                <div>${r.comment}</div>
                                <div class="text-muted small">${new Date(r.created_at).toLocaleString()}</div>
                                ${isMine ? `<div class="mt-2">
                                    <button class="btn btn-sm btn-outline-secondary edit-review-btn" data-review-id="${r.id}" data-rating="${r.rating}" data-comment="${encodeURIComponent(r.comment)}">Edit</button>
                                    <button class="btn btn-sm btn-outline-danger delete-review-btn" data-review-id="${r.id}">Delete</button>
                                </div>` : ''}
                            </div>
                        </div>`;
                    }
                });
            }
            $('#reviews-section').html(html);
        });
    });

    // Handle inline edit form submit
    $(document).on('submit', '.edit-review-inline-form', function (e) {
        e.preventDefault();
        const $form = $(this);
        const reviewId = $form.closest('.review-card').data('review-id');
        const newRating = $form.find('select').val();
        const newComment = $form.find('textarea').val();
        if (!newRating || !newComment) return;
        $.ajax({
            url: `${API_BASE}/review/${reviewId}`,
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            data: JSON.stringify({ rating: newRating, comment: newComment }),
            success: function () {
                $form.find('.edit-inline-message').html('<div class="alert alert-success">Review updated!</div>');
                setTimeout(() => { editingReviewId = null; loadReviews(); }, 800);
            },
            error: function (xhr) {
                let msg = 'Failed to update review.';
                if (xhr.responseJSON && xhr.responseJSON.error) msg += ' ' + xhr.responseJSON.error;
                $form.find('.edit-inline-message').html('<div class="alert alert-danger">' + msg + '</div>');
            }
        });
    });

    // Cancel inline edit
    $(document).on('click', '.cancel-edit-inline-btn', function () {
        editingReviewId = null;
        loadReviews();
    });

    // Add review form (if logged in)
    const token = localStorage.getItem('token');
    if (token) {
        $('#add-review-section').html(`
            <h4>Add a Review</h4>
            <form id="review-form">
                <div class="form-group">
                    <label for="rating">Rating</label>
                    <select id="rating" class="form-control" required>
                        <option value="">Select</option>
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Good</option>
                        <option value="3">3 - Average</option>
                        <option value="2">2 - Poor</option>
                        <option value="1">1 - Terrible</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="comment">Comment</label>
                    <textarea id="comment" class="form-control" rows="3" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Submit Review</button>
                <div id="review-message" class="mt-2"></div>
            </form>
        `);
        $('#review-form').on('submit', function (e) {
            e.preventDefault();
            const rating = $('#rating').val();
            const comment = $('#comment').val();
            if (!rating || !comment) return;
            $.ajax({
                url: `${API_BASE}/product/${productId}/reviews`,
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                data: JSON.stringify({ rating, comment }),
                success: function () {
                    $('#review-message').html('<div class="alert alert-success">Review submitted!</div>');
                    $('#review-form')[0].reset();
                    loadReviews();
                },
                error: function (xhr) {
                    let msg = 'Failed to submit review.';
                    if (xhr.responseJSON && xhr.responseJSON.error) msg += ' ' + xhr.responseJSON.error;
                    $('#review-message').html('<div class="alert alert-danger">' + msg + '</div>');
                }
            });
        });
    } else {
        $('#add-review-section').html('<div class="alert alert-info">Log in to add a review.</div>');
    }
});
