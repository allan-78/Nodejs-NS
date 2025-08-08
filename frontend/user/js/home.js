const API_BASE = window.API_BASE_URL || 'http://localhost:3000/api/v1'; // Change port if needed

// Format image path to ensure correct URL structure
function formatImagePath(img) {
    // If path is null or undefined, return default image
    if (!img) {
        return `${API_BASE.replace('/api/v1', '')}/images/no-image.svg`;
    }
    
    // If path already starts with http:// or https://, return as is
    if (/^https?:\/\//.test(img)) {
        return img;
    }
    
    // If path starts with /, it's already a full path
    if (img.startsWith('/')) {
        return `${API_BASE.replace('/api/v1', '')}${img}`;
    }
    
    // If path includes 'products/', it's a relative path from the images directory
    if (img.includes('products/')) {
        return `${API_BASE.replace('/api/v1', '')}/images/${img}`;
    } else {
        // Otherwise, assume it's a product image filename in the products folder
        return `${API_BASE.replace('/api/v1', '')}/images/products/${img}`;
    }
}

function getUserId() {
    // Example: get user_id from localStorage after login
    return localStorage.getItem('user_id');
}

function getAuthHeader() {
    // Example: get JWT from localStorage after login
    const token = localStorage.getItem('token');
    return token ? { Authorization: 'Bearer ' + token } : {};
}

function updateCartCount() {
    const user_id = getUserId();
    if (!user_id) {
        $('#itemCount').css('display', 'none');
        return;
    }
    $.ajax({
        url: `${API_BASE}/cart/count?user_id=${user_id}`,
        method: 'GET',
        headers: getAuthHeader(),
        success: function (data) {
            if (data.count > 0) {
                $('#itemCount').text(data.count).css('display', 'inline-block');
            } else {
                $('#itemCount').css('display', 'none');
            }
        }
    });
}

// Fetch categories for filter sidebar
function loadCategoriesForFilter() {
    $.get(`${API_BASE}/categories`, function(data) {
        let html = '';
        if (data.categories && data.categories.length) {
            data.categories.forEach(cat => {
                html += `<div class="form-check">
                    <input class="form-check-input filter-category-checkbox" type="checkbox" value="${cat.id}" id="cat-${cat.id}">
                    <label class="form-check-label" for="cat-${cat.id}">${cat.name}</label>
                </div>`;
            });
        }
        $('#filter-categories').html(html);
    });
}

// Get URL parameters
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        search: params.get('search'),
        category: params.get('category')
    };
}

// Initialize filters from URL parameters
function initializeFiltersFromUrl() {
    const { search, category } = getUrlParams();
    
    if (search) {
        $('#search-box').val(search);
    }
    
    if (category) {
        $(`#cat-${category}`).prop('checked', true);
    }
}

// Initialize the page
$(document).ready(function() {
    loadCategoriesForFilter();
    
    // Initialize filters from URL parameters after categories are loaded
    setTimeout(() => {
        initializeFiltersFromUrl();
        loadProductsWithFilters();
    }, 500);
    
    // Update URL when filters change
    function updateURL() {
        const searchQuery = $('#search-box').val().trim();
        const selectedCategory = $('.filter-category-checkbox:checked').first().val();
        let url = new URL(window.location.href);
        let params = new URLSearchParams(url.search);
        
        if (searchQuery) {
            params.set('search', searchQuery);
        } else {
            params.delete('search');
        }
        
        if (selectedCategory) {
            params.set('category', selectedCategory);
        } else {
            params.delete('category');
        }
        
        window.history.replaceState({}, '', `${url.pathname}?${params}`);
    }
    
    // Add URL update to existing event handlers
    $('#search-box').on('change', updateURL);
    $('.filter-category-checkbox').on('change', updateURL);
});

// Fetch and display products with filters
function loadProductsWithFilters() {
    let selectedCategories = [];
    $('.filter-category-checkbox:checked').each(function() {
        selectedCategories.push($(this).val());
    });
    
    // Get URL parameters
    const { search, category } = getUrlParams();
    
    // If there's a category in the URL and no checkboxes are checked, use the URL category
    if (category && selectedCategories.length === 0) {
        selectedCategories.push(category);
    }
    
    let minPrice = $('#filter-min-price').val();
    let maxPrice = $('#filter-max-price').val();
    let searchQuery = search || ($('#search-box').val() || '').trim();
    let sortBy = $('#filter-sort').val();
    
    let params = {};
    if (selectedCategories.length) params.categories = selectedCategories.join(',');
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (searchQuery) params.search = searchQuery;
    if (sortBy) params.sort = sortBy;
    
    // Show loading indicator
    $("#items").html('<div class="text-center"><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div></div>');
    
    $.ajax({
        method: "GET",
        url: `${API_BASE}/items`,
        data: params,
        dataType: 'json',
        success: function (data) {
            $("#items").empty();
            
            if (!data.products || data.products.length === 0) {
                $("#items").html('<div class="col-12 text-center"><div class="alert alert-info">No products found matching your criteria.</div></div>');
                return;
            }
            
            let row;
            $.each(data.products, function (key, value) {
                if (key % 4 === 0) {
                    row = $('<div class="row"></div>');
                    $("#items").append(row);
                }
                // Show average rating as stars
                let avgRating = value.avg_rating !== undefined && value.avg_rating !== null ? value.avg_rating : null;
                let starsHtml = avgRating !== null && !isNaN(Number(avgRating)) ? `<span class="text-warning">${'★'.repeat(Math.round(Number(avgRating)))}${'☆'.repeat(5 - Math.round(Number(avgRating)))}</span> <span class="small text-muted">${Number(avgRating).toFixed(1)}/5</span>` : '<span class="text-muted">No rating</span>';
                var item = `<div class="col-md-3 mb-4">
                    <div class="card h-100 shadow product-main-card">
                        <img src="${value.images && value.images.length > 0 ? formatImagePath(value.images[0].path) : formatImagePath('no-image.svg')}" class="card-img-top" alt="${value.name}" style="height:180px;object-fit:cover;">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${value.name}</h5>
                            <div class="mb-2">${starsHtml}</div>
                            <p class="card-text">${value.description}</p>
                            <p class="card-text font-weight-bold">₱ ${value.price}</p>
                            <p class="card-text"><small class="text-muted">Stock: ${value.stock ?? 0}</small></p>
                            <button class="btn btn-primary mt-auto show-details" data-id="${value.id}" data-name="${value.name}" data-description="${value.description}" data-price="${value.price}" data-image="${value.images && value.images.length > 0 ? formatImagePath(value.images[0].path) : formatImagePath('no-image.svg')}" data-stock="${value.stock ?? 0}">Details</button>
                        </div>
                    </div>
                </div>`;
                row.append(item);
            });
            
            // Re-attach event handlers for details buttons
            $(".show-details").off('click').on('click', function () {
                const id = $(this).data('id');
                showProductDetails(id);
            });
        },
        error: function (error) {
            $("#items").html('<div class="col-12 text-center"><div class="alert alert-danger">Failed to load products. Please try again.</div></div>');
        }
    });
}
            // Re-attach event handlers for details buttons
            $(".show-details").off('click').on('click', function () {
                const id = $(this).data('id');
                showProductDetails(id);
            });
                    // Fetch and show reviews
                    function loadModalReviews() {
                        $.get(`${API_BASE}/product/${id}/reviews`, function (data) {
                            let html = '<h5>Reviews</h5>';
                            if (!data.reviews || !data.reviews.length) {
                                let userId = getUserId();
                                // If user can review, show a custom message and the review form
                                if (token && canReview) {
                                    html += '<div class="alert alert-info">You have not reviewed this product yet. <b>Review this product because you already bought it and your order is completed.</b></div>';
                                    // Show the add review form directly
                                    $('#modal-add-review-section').show();
                                } else {
                                    html += '<div class="alert alert-info">No reviews yet.</div>';
                                    $('#modal-add-review-section').hide();
                                }
                            } else {
                                // Hide the add review form if user already reviewed
                                if (data.reviews.some(r => r.user_id == getUserId())) {
                                    $('#modal-add-review-section').hide();
                                } else if (token && canReview) {
                                    $('#modal-add-review-section').show();
                                }
                                let userId = getUserId();
                                data.reviews.forEach(r => {
                                    let canEdit = userId && r.user_id && userId == r.user_id;
                                    if (canEdit && r.editing) {
                                        html += `<div class='card review-card mb-2' data-review-id='${r.id}'>
                                            <div class='card-body'>
                                                <form class='edit-review-inline-form'>
                                                    <div class='form-group mb-2'>
                                                        <label for='edit-inline-rating-${r.id}' class='mb-0'>Rating</label>
                                                        <select id='edit-inline-rating-${r.id}' class='form-control form-control-sm' required>
                                                            <option value=''>Select</option>
                                                            <option value='5' ${r.rating==5?'selected':''}>5 - Excellent</option>
                                                            <option value='4' ${r.rating==4?'selected':''}>4 - Good</option>
                                                            <option value='3' ${r.rating==3?'selected':''}>3 - Average</option>
                                                            <option value='2' ${r.rating==2?'selected':''}>2 - Poor</option>
                                                            <option value='1' ${r.rating==1?'selected':''}>1 - Terrible</option>
                                                        </select>
                                                    </div>
                                                    <div class='form-group mb-2'>
                                                        <label for='edit-inline-comment-${r.id}' class='mb-0'>Comment</label>
                                                        <textarea id='edit-inline-comment-${r.id}' class='form-control form-control-sm' rows='2' required>${r.comment}</textarea>
                                                    </div>
                                                    <button type='submit' class='btn btn-sm btn-primary'>Save</button>
                                                    <button type='button' class='btn btn-sm btn-secondary cancel-edit-inline-btn ml-2'>Cancel</button>
                                                    <div class='edit-inline-message mt-2'></div>
                                                </form>
                                            </div>
                                        </div>`;
                                    } else {
                                        html += `<div class="card review-card mb-2"><div class="card-body p-2">
                                            <div><b>${r.user_name || 'Anonymous'}</b> <span class="text-warning">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span></div>
                                            <div>${r.comment}</div>
                                            <div class="text-muted small">${new Date(r.created_at).toLocaleString()}</div>
                                            ${canEdit ? `
                                                <button class="btn btn-sm btn-outline-primary edit-review-btn mt-2" data-review-id="${r.id}">Edit</button>
                                                <button class="btn btn-sm btn-outline-danger delete-review-btn mt-2" data-review-id="${r.id}">Delete</button>
                                            ` : ''}
                                        </div></div>`;
                                    }
                                });
                        
                            }});             
                            
// Handle delete review in modal
$(document).on('click', '.delete-review-btn', function () {
    const reviewId = $(this).data('review-id');
    if (!confirm('Are you sure you want to delete this review?')) return;
    $.ajax({
        url: `${API_BASE}/review/${reviewId}`,
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        success: function () {
            // Reload reviews in modal
            $(".show-details[data-id]").first().click(); // re-open modal to refresh
        },
        error: function () {
            alert('Failed to delete review.');
        }
    });

// Inline edit review in modal
$(document).on('click', '.edit-review-btn', function () {
    const reviewId = $(this).data('review-id');
    // Reload reviews with editing state
    const id = $('#detailsItemId').val() || $('.show-details[data-id]').first().data('id');
    $.get(`${API_BASE}/product/${id}/reviews`, function (data) {
        let userId = getUserId();
        data.reviews.forEach(r => {
            if (r.id == reviewId && userId && r.user_id && userId == r.user_id) {
                r.editing = true;
            }
        });
        let html = '<h5>Reviews</h5>';
        if (!data.reviews || !data.reviews.length) {
            html += '<div class="alert alert-info">No reviews yet.</div>';
        } else {
            data.reviews.forEach(r => {
                let canEdit = userId && r.user_id && userId == r.user_id;
                if (canEdit && r.editing) {
                    html += `<div class='card review-card mb-2' data-review-id='${r.id}'>
                        <div class='card-body'>
                            <form class='edit-review-inline-form'>
                                <div class='form-group mb-2'>
                                    <label for='edit-inline-rating-${r.id}' class='mb-0'>Rating</label>
                                    <select id='edit-inline-rating-${r.id}' class='form-control form-control-sm' required>
                                        <option value=''>Select</option>
                                        <option value='5' ${r.rating==5?'selected':''}>5 - Excellent</option>
                                        <option value='4' ${r.rating==4?'selected':''}>4 - Good</option>
                                        <option value='3' ${r.rating==3?'selected':''}>3 - Average</option>
                                        <option value='2' ${r.rating==2?'selected':''}>2 - Poor</option>
                                        <option value='1' ${r.rating==1?'selected':''}>1 - Terrible</option>
                                    </select>
                                </div>
                                <div class='form-group mb-2'>
                                    <label for='edit-inline-comment-${r.id}' class='mb-0'>Comment</label>
                                    <textarea id='edit-inline-comment-${r.id}' class='form-control form-control-sm' rows='2' required>${r.comment}</textarea>
                                </div>
                                <button type='submit' class='btn btn-sm btn-primary'>Save</button>
                                <button type='button' class='btn btn-sm btn-secondary cancel-edit-inline-btn ml-2'>Cancel</button>
                                <div class='edit-inline-message mt-2'></div>
                            </form>
                        </div>
                    </div>`;
                } else {
                    html += `<div class="card review-card mb-2"><div class="card-body p-2">
                        <div><b>${r.user_name || 'Anonymous'}</b> <span class="text-warning">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span></div>
                        <div>${r.comment}</div>
                        <div class="text-muted small">${new Date(r.created_at).toLocaleString()}</div>
                        ${canEdit ? `
                            <button class="btn btn-sm btn-outline-primary edit-review-btn mt-2" data-review-id="${r.id}">Edit</button>
                            <button class="btn btn-sm btn-outline-danger delete-review-btn mt-2" data-review-id="${r.id}">Delete</button>
                        ` : ''}
                    </div></div>`;
                }
            });
        }
        $('#modal-reviews-section').html(html);
                            // If user can review, focus the add review form
                            if (token && canReview && (!data.reviews || !data.reviews.some(r => r.user_id == getUserId()))) {
                                $('#modal-add-review-section').show();
                            }
    });

// Handle inline edit form submit in modal
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
            setTimeout(() => { $(".show-details[data-id]").first().click(); }, 1000);
        },
        error: function (xhr) {
            let msg = 'Failed to update review.';
            if (xhr.responseJSON && xhr.responseJSON.error) msg += ' ' + xhr.responseJSON.error;
            $form.find('.edit-inline-message').html('<div class="alert alert-danger">' + msg + '</div>');
        }
    });
});

// Cancel inline edit in modal
$(document).on('click', '.cancel-edit-inline-btn', function () {
    $(".show-details[data-id]").first().click();
});
                         
                    
                    loadModalReviews();
                    // Add review form (if logged in and can_review)
                    const token = localStorage.getItem('token');
                    if (token && canReview) {
                        $('#modal-add-review-section').html(`
                            <h6>Add a Review</h6>
                            <form id="modal-review-form">
                                <div class="form-group mb-2">
                                    <label for="modal-rating">Rating</label>
                                    <select id="modal-rating" class="form-control" required>
                                        <option value="">Select</option>
                                        <option value="5">5 - Excellent</option>
                                        <option value="4">4 - Good</option>
                                        <option value="3">3 - Average</option>
                                        <option value="2">2 - Poor</option>
                                        <option value="1">1 - Terrible</option>
                                    </select>
                                </div>
                                <div class="form-group mb-2">
                                    <label for="modal-comment">Comment</label>
                                    <textarea id="modal-comment" class="form-control" rows="2" required></textarea>
                                </div>
                                <button type="submit" class="btn btn-sm btn-primary">Submit Review</button>
                                <div id="modal-review-message" class="mt-2"></div>
                            </form>
                        `);
                        $('#modal-review-form').on('submit', function (e) {
                            e.preventDefault();
                            const rating = $('#modal-rating').val();
                            const comment = $('#modal-comment').val();
                            if (!rating || !comment) return;
                            $.ajax({
                                url: `${API_BASE}/product/${id}/reviews`,
                                method: 'POST',
                                headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                                data: JSON.stringify({ rating, comment }),
                                success: function () {
                                    $('#modal-review-message').html('<div class="alert alert-success">Review submitted!</div>');
                                    $('#modal-review-form')[0].reset();
                                    // Reload reviews
                                    loadModalReviews();
                                },
                                error: function (xhr) {
                                    let msg = 'Failed to submit review.';
                                    if (xhr.responseJSON && xhr.responseJSON.error) msg += ' ' + xhr.responseJSON.error;
                                    $('#modal-review-message').html('<div class="alert alert-danger">' + msg + '</div>');
                                }
                            });
                        });
                    } else if (token && !canReview) {
                        $('#modal-add-review-section').html('<div class="alert alert-info">You can only review this product after your order is <b>completed</b>.</div>');
                    } else {
                        $('#modal-add-review-section').html('<div class="alert alert-info">Log in to add a review.</div>');
                    }
                })
                $('#productDetailsModal').modal('show');
            }).fail(function() {
                alert('Failed to load product details.');
            });
        }

$(document).ready(function () {
    // Health check for backend/database connection
    $.get(`${API_BASE}/health`, function (data) {
        if (data.success) {
            $("body").prepend('<div class="alert alert-success text-center" id="healthCheck">' + data.message + '</div>');
            setTimeout(function() { $('#healthCheck').fadeOut(); }, 3000);
        } else {
            $("body").prepend('<div class="alert alert-danger text-center" id="healthCheck">Backend/database connection failed</div>');
        }
    }).fail(function() {
        $("body").prepend('<div class="alert alert-danger text-center" id="healthCheck">Backend/database connection failed</div>');
    });



    // Fetch and display products
    $.ajax({
        method: "GET",
        url: `${API_BASE}/items`,
        dataType: 'json',
        success: function (data) {
            $("#items").empty();
            let row;
            $.each(data.products, function (key, value) {
                if (key % 4 === 0) {
                    row = $('<div class="row"></div>');
                    $("#items").append(row);
                }
                // Show average rating as stars
                let avgRating = value.avg_rating !== undefined && value.avg_rating !== null ? value.avg_rating : null;
                let starsHtml = avgRating !== null && !isNaN(Number(avgRating)) ? `<span class="text-warning">${'★'.repeat(Math.round(Number(avgRating)))}${'☆'.repeat(5 - Math.round(Number(avgRating)))}</span> <span class="small text-muted">${Number(avgRating).toFixed(1)}/5</span>` : '<span class="text-muted">No rating</span>';
                var item = `<div class="col-md-3 mb-4">
                    <div class="card h-100 shadow product-main-card">
                        <img src="${value.images && value.images.length > 0 ? formatImagePath(value.images[0].path) : formatImagePath('no-image.svg')}" class="card-img-top" alt="${value.name}" style="height:180px;object-fit:cover;">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${value.name}</h5>
                            <div class="mb-2">${starsHtml}</div>
                            <p class="card-text">${value.description}</p>
                            <p class="card-text font-weight-bold">₱ ${value.price}</p>
                            <p class="card-text"><small class="text-muted">Stock: ${value.stock ?? 0}</small></p>
                            <button class="btn btn-primary mt-auto show-details" data-id="${value.id}" data-name="${value.name}" data-description="${value.description}" data-price="${value.price}" data-image="${value.image_path}" data-stock="${value.stock ?? 0}">Details</button>
                        </div>
                    </div>
                </div>`;
                row.append(item);
            });
            if ($('#productDetailsModal').length === 0) {
                $('body').append(`
                <div class="modal fade" id="productDetailsModal" tabindex="-1" role="dialog" aria-labelledby="productDetailsModalLabel" aria-hidden="true">
                  <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title" id="productDetailsModalLabel"></h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                          <span aria-hidden="true">&times;</span>
                        </button>
                      </div>
                      <div class="modal-body text-center" id="productDetailsModalBody">
                        <!-- Product details will be injected here -->
                      </div>
                    </div>
                  </div>
                </div>
                `);
            }
            $(".show-details").on('click', function () {
                const id = $(this).data('id');
                // Fetch product details (with avg rating, images, etc)
                $.get(`${API_BASE}/product/${id}`, function (data) {
                    console.log('Product details response:', data); // Debug log
                    let p = data.product;
                    let canReview = data.can_review; // backend should return this
                    let userId = getUserId();
                    let imagesHtml = '';
                    if (p.images && p.images.length) {
                        imagesHtml = `<img src="${formatImagePath(p.images[0].path)}" class="img-fluid rounded shadow mb-3" style="max-height:220px;">`;
                    } else {
                        imagesHtml = `<img src="${formatImagePath('no-image.svg')}" class="img-fluid rounded shadow mb-3" style="max-height:220px;">`;
                    }
                    let detailsHtml = `
                        <div class="card p-3 border-0 product-details-modal-card">
                            <div class="row">
                                <div class="col-md-5 d-flex align-items-center justify-content-center">${imagesHtml}</div>
                                <div class="col-md-7 text-left">
                                    <h4 class="mb-1">${p.name}</h4>
                                    <div class="mb-2"><b>Price:</b> <span class="h5 text-success">₱${p.price}</span></div>
                                    <div class="mb-2"><b>Stock:</b> ${p.stock}</div>
                                    <div class="mb-2"><b>Average Rating:</b> <span class="text-warning">${
                                        (typeof p.avg_rating === 'number' && !isNaN(p.avg_rating))
                                            ? '★'.repeat(Math.round(p.avg_rating)) + '☆'.repeat(5 - Math.round(p.avg_rating)) + ` <span class='small text-muted'>${p.avg_rating.toFixed(1)}/5</span>`
                                            : 'N/A'
                                    }</span></div>
                                    <div class="mb-3"><b>Description:</b><br>${p.description ? p.description : '<em>No description available.</em>'}</div>
                                    <div class="mb-3">
                                        <label for="detailsQty"><b>Quantity:</b></label>
                                        <input type="number" class="form-control d-inline-block w-auto ml-2" id="detailsQty" min="1" max="${p.stock}" value="1">
                                        <input type="hidden" id="detailsItemId" value="${id}">
                                        <button type="button" class="btn btn-primary ml-2" id="detailsAddToCart">Add to Cart</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="modal-reviews-section" class="mt-4"></div>
                        <div id="modal-add-review-section" class="mt-3"></div>
                    `;
                    $('#productDetailsModalBody').html(detailsHtml);
                    // Fetch and show reviews
                    function loadModalReviews() {
                        $.get(`${API_BASE}/product/${id}/reviews`, function (data) {
                            let html = '<h5>Reviews</h5>';
                            if (!data.reviews || !data.reviews.length) {
                                html += '<div class="alert alert-info">No reviews yet.</div>';
                            } else {
                                let userId = getUserId();
                                data.reviews.forEach(r => {
                                    let canEdit = userId && r.user_id && userId == r.user_id;
                                    if (canEdit && r.editing) {
                                        html += `<div class='card review-card mb-2' data-review-id='${r.id}'>
                                            <div class='card-body'>
                                                <form class='edit-review-inline-form'>
                                                    <div class='form-group mb-2'>
                                                        <label for='edit-inline-rating-${r.id}' class='mb-0'>Rating</label>
                                                        <select id='edit-inline-rating-${r.id}' class='form-control form-control-sm' required>
                                                            <option value=''>Select</option>
                                                            <option value='5' ${r.rating==5?'selected':''}>5 - Excellent</option>
                                                            <option value='4' ${r.rating==4?'selected':''}>4 - Good</option>
                                                            <option value='3' ${r.rating==3?'selected':''}>3 - Average</option>
                                                            <option value='2' ${r.rating==2?'selected':''}>2 - Poor</option>
                                                            <option value='1' ${r.rating==1?'selected':''}>1 - Terrible</option>
                                                        </select>
                                                    </div>
                                                    <div class='form-group mb-2'>
                                                        <label for='edit-inline-comment-${r.id}' class='mb-0'>Comment</label>
                                                        <textarea id='edit-inline-comment-${r.id}' class='form-control form-control-sm' rows='2' required>${r.comment}</textarea>
                                                    </div>
                                                    <button type='submit' class='btn btn-sm btn-primary'>Save</button>
                                                    <button type='button' class='btn btn-sm btn-secondary cancel-edit-inline-btn ml-2'>Cancel</button>
                                                    <div class='edit-inline-message mt-2'></div>
                                                </form>
                                            </div>
                                        </div>`;
                                    } else {
                                        html += `<div class="card review-card mb-2"><div class="card-body p-2">
                                            <div><b>${r.user_name || 'Anonymous'}</b> <span class="text-warning">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span></div>
                                            <div>${r.comment}</div>
                                            <div class="text-muted small">${new Date(r.created_at).toLocaleString()}</div>
                                            ${canEdit ? '<button class="btn btn-sm btn-outline-primary edit-review-btn mt-2" data-review-id="' + r.id + '">Edit</button> <button class="btn btn-sm btn-outline-danger delete-review-btn mt-2" data-review-id="' + r.id + '">Delete</button>' : ''}
                                        </div></div>`;
                                    }
                                });
                            }
                            $('#modal-reviews-section').html(html);

                            // Attach handlers after rendering
                            $('.delete-review-btn').off('click').on('click', function () {
                                const reviewId = $(this).data('review-id');
                                if (!confirm('Are you sure you want to delete this review?')) return;
                                $.ajax({
                                    url: `${API_BASE}/review/${reviewId}`,
                                    method: 'DELETE',
                                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                                    success: function () {
                                        loadModalReviews();
                                    },
                                    error: function () {
                                        alert('Failed to delete review.');
                                    }
                                });
                            });
                            $('.edit-review-btn').off('click').on('click', function () {
                                const reviewId = $(this).data('review-id');
                                // Mark this review as editing and reload
                                data.reviews.forEach(r => { r.editing = (r.id === reviewId); });
                                let html = '<h5>Reviews</h5>';
                                data.reviews.forEach(r => {
                                    let canEdit = userId && r.user_id && userId == r.user_id;
                                    if (canEdit && r.editing) {
                                        html += `<div class='card review-card mb-2' data-review-id='${r.id}'>
                                            <div class='card-body'>
                                                <form class='edit-review-inline-form'>
                                                    <div class='form-group mb-2'>
                                                        <label for='edit-inline-rating-${r.id}' class='mb-0'>Rating</label>
                                                        <select id='edit-inline-rating-${r.id}' class='form-control form-control-sm' required>
                                                            <option value=''>Select</option>
                                                            <option value='5' ${r.rating==5?'selected':''}>5 - Excellent</option>
                                                            <option value='4' ${r.rating==4?'selected':''}>4 - Good</option>
                                                            <option value='3' ${r.rating==3?'selected':''}>3 - Average</option>
                                                            <option value='2' ${r.rating==2?'selected':''}>2 - Poor</option>
                                                            <option value='1' ${r.rating==1?'selected':''}>1 - Terrible</option>
                                                        </select>
                                                    </div>
                                                    <div class='form-group mb-2'>
                                                        <label for='edit-inline-comment-${r.id}' class='mb-0'>Comment</label>
                                                        <textarea id='edit-inline-comment-${r.id}' class='form-control form-control-sm' rows='2' required>${r.comment}</textarea>
                                                    </div>
                                                    <button type='submit' class='btn btn-sm btn-primary'>Save</button>
                                                    <button type='button' class='btn btn-sm btn-secondary cancel-edit-inline-btn ml-2'>Cancel</button>
                                                    <div class='edit-inline-message mt-2'></div>
                                                </form>
                                            </div>
                                        </div>`;
                                    } else {
                                        html += `<div class="card review-card mb-2"><div class="card-body p-2">
                                            <div><b>${r.user_name || 'Anonymous'}</b> <span class="text-warning">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span></div>
                                            <div>${r.comment}</div>
                                            <div class="text-muted small">${new Date(r.created_at).toLocaleString()}</div>
                                            ${canEdit ? `
                                                <button class="btn btn-sm btn-outline-primary edit-review-btn mt-2" data-review-id="${r.id}">Edit</button>
                                                <button class="btn btn-sm btn-outline-danger delete-review-btn mt-2" data-review-id="${r.id}">Delete</button>
                                            ` : ''}
                                        </div></div>`;
                                    }
                                });
                                $('#modal-reviews-section').html(html);
                                // Re-attach form handler
                                $('.edit-review-inline-form').off('submit').on('submit', function (e) {
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
                                            loadModalReviews();
                                        },
                                        error: function (xhr) {
                                            let msg = 'Failed to update review.';
                                            if (xhr.responseJSON && xhr.responseJSON.error) msg += ' ' + xhr.responseJSON.error;
                                            $form.find('.edit-inline-message').html('<div class="alert alert-danger">' + msg + '</div>');
                                        }
                                    });
                                });
                                // Cancel button
                                $('.cancel-edit-inline-btn').off('click').on('click', function () {
                                    loadModalReviews();
                                });
                            });
                        });
                    }
                    loadModalReviews();
                    // Add review form (if logged in and can_review)
                    const token = localStorage.getItem('token');
                    if (token && canReview) {
                        $('#modal-add-review-section').html(`
                            <h6>Add a Review</h6>
                            <form id="modal-review-form">
                                <div class="form-group mb-2">
                                    <label for="modal-rating">Rating</label>
                                    <select id="modal-rating" class="form-control" required>
                                        <option value="">Select</option>
                                        <option value="5">5 - Excellent</option>
                                        <option value="4">4 - Good</option>
                                        <option value="3">3 - Average</option>
                                        <option value="2">2 - Poor</option>
                                        <option value="1">1 - Terrible</option>
                                    </select>
                                </div>
                                <div class="form-group mb-2">
                                    <label for="modal-comment">Comment</label>
                                    <textarea id="modal-comment" class="form-control" rows="2" required></textarea>
                                </div>
                                <button type="submit" class="btn btn-sm btn-primary">Submit Review</button>
                                <div id="modal-review-message" class="mt-2"></div>
                            </form>
                        `);
                        $('#modal-review-form').on('submit', function (e) {
                            e.preventDefault();
                            const rating = $('#modal-rating').val();
                            const comment = $('#modal-comment').val();
                            if (!rating || !comment) return;
                            $.ajax({
                                url: `${API_BASE}/product/${id}/reviews`,
                                method: 'POST',
                                headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                                data: JSON.stringify({ rating, comment }),
                                success: function () {
                                    $('#modal-review-message').html('<div class="alert alert-success">Review submitted!</div>');
                                    $('#modal-review-form')[0].reset();
                                    // Reload reviews
                                    loadModalReviews();
                                },
                                error: function (xhr) {
                                    let msg = 'Failed to submit review.';
                                    if (xhr.responseJSON && xhr.responseJSON.error) msg += ' ' + xhr.responseJSON.error;
                                    $('#modal-review-message').html('<div class="alert alert-danger">' + msg + '</div>');
                                }
                            });
                        });
                    } else if (token && !canReview) {
                        $('#modal-add-review-section').html('<div class="alert alert-info">You can only review this product after your order is <b>completed</b>.</div>');
                    } else {
                        $('#modal-add-review-section').html('<div class="alert alert-info">Log in to add a review.</div>');
                    }
                });
                $('#productDetailsModal').modal('show');
            });
        },
        error: function (error) {
            $("#items").html('<div class="alert alert-danger">Failed to load products.</div>');
        }
    });
});
    // Initial cart count
    updateCartCount();

    // Initial load of products with filters
    loadProductsWithFilters();

    // Cart logic (add to cart, show count, etc.)
    function getCart() {
        let cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }
    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

// Function to show product details in modal
function showProductDetails(id) {
    // Fetch product details (with avg rating, images, etc)
    $.get(`${API_BASE}/product/${id}`, function (data) {
        console.log('Product details response:', data); // Debug log
        let p = data.product;
        let canReview = data.can_review; // backend should return this
        let userId = getUserId();
        let imagesHtml = '';
        if (p.images && p.images.length) {
            imagesHtml = `<img src="${formatImagePath(p.images[0].path)}" class="img-fluid rounded shadow mb-3" style="max-height:220px;">`;
        } else {
            imagesHtml = `<img src="${formatImagePath('no-image.svg')}" class="img-fluid rounded shadow mb-3" style="max-height:220px;">`;
        }
        let detailsHtml = `
            <div class="card p-3 border-0 product-details-modal-card">
                <div class="row">
                    <div class="col-md-5 d-flex align-items-center justify-content-center">${imagesHtml}</div>
                    <div class="col-md-7 text-left">
                        <h4 class="mb-1">${p.name}</h4>
                        <div class="mb-2"><b>Price:</b> <span class="h5 text-success">₱${p.price}</span></div>
                        <div class="mb-2"><b>Stock:</b> ${p.stock}</div>
                        <div class="mb-2"><b>Average Rating:</b> <span class="text-warning">${
                            (typeof p.avg_rating === 'number' && !isNaN(p.avg_rating))
                                ? '★'.repeat(Math.round(p.avg_rating)) + '☆'.repeat(5 - Math.round(p.avg_rating)) + ` <span class='small text-muted'>${p.avg_rating.toFixed(1)}/5</span>`
                                : 'N/A'
                        }</span></div>
                        <div class="mb-3"><b>Description:</b><br>${p.description ? p.description : '<em>No description available.</em>'}</div>
                        <div class="mb-3">
                            <label for="detailsQty"><b>Quantity:</b></label>
                            <input type="number" class="form-control d-inline-block w-auto ml-2" id="detailsQty" min="1" max="${p.stock}" value="1">
                            <input type="hidden" id="detailsItemId" value="${id}">
                            <button type="button" class="btn btn-primary ml-2" id="detailsAddToCart">Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div>
            <div id="modal-reviews-section" class="mt-4"></div>
            <div id="modal-add-review-section" class="mt-3"></div>
        `;
        
        if ($('#productDetailsModal').length === 0) {
            $('body').append(`
            <div class="modal fade" id="productDetailsModal" tabindex="-1" role="dialog" aria-labelledby="productDetailsModalLabel" aria-hidden="true">
              <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="productDetailsModalLabel"></h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="modal-body text-center" id="productDetailsModalBody">
                    <!-- Product details will be injected here -->
                  </div>
                </div>
              </div>
            </div>
            `);
        }
        
        $('#productDetailsModalLabel').text(p.name);
        $('#productDetailsModalBody').html(detailsHtml);
        
        // Load reviews for this product
        loadModalReviews(id, canReview);
        
        $('#productDetailsModal').modal('show');
    }).fail(function() {
        alert('Failed to load product details.');
    });
}

// Function to load reviews for modal
function loadModalReviews(productId, canReview) {
    $.get(`${API_BASE}/product/${productId}/reviews`, function (data) {
        let html = '<h5>Reviews</h5>';
        if (!data.reviews || !data.reviews.length) {
            html += '<div class="alert alert-info">No reviews yet.</div>';
        } else {
            let userId = getUserId();
            data.reviews.forEach(r => {
                let canEdit = userId && r.user_id && userId == r.user_id;
                html += `<div class="card review-card mb-2"><div class="card-body p-2">
                    <div><b>${r.user_name || 'Anonymous'}</b> <span class="text-warning">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span></div>
                    <div>${r.comment}</div>
                    <div class="text-muted small">${new Date(r.created_at).toLocaleString()}</div>
                    ${canEdit ? `
                        <button class="btn btn-sm btn-outline-primary edit-review-btn mt-2" data-review-id="${r.id}" data-product-id="${productId}">Edit</button>
                        <button class="btn btn-sm btn-outline-danger delete-review-btn mt-2" data-review-id="${r.id}" data-product-id="${productId}">Delete</button>
                    ` : ''}
                </div></div>`;
            });
        }
        $('#modal-reviews-section').html(html);
        
        // Add review form
        const token = localStorage.getItem('token');
        if (token && canReview) {
            $('#modal-add-review-section').html(`
                <h6>Add a Review</h6>
                <form id="modal-review-form">
                    <div class="form-group mb-2">
                        <label for="modal-rating">Rating</label>
                        <select id="modal-rating" class="form-control" required>
                            <option value="">Select</option>
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Good</option>
                            <option value="3">3 - Average</option>
                            <option value="2">2 - Poor</option>
                            <option value="1">1 - Terrible</option>
                        </select>
                    </div>
                    <div class="form-group mb-2">
                        <label for="modal-comment">Comment</label>
                        <textarea id="modal-comment" class="form-control" rows="2" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-sm btn-primary">Submit Review</button>
                    <div id="modal-review-message" class="mt-2"></div>
                </form>
            `);
            
            $('#modal-review-form').on('submit', function (e) {
                e.preventDefault();
                const rating = $('#modal-rating').val();
                const comment = $('#modal-comment').val();
                if (!rating || !comment) return;
                
                $.ajax({
                    url: `${API_BASE}/product/${productId}/reviews`,
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                    data: JSON.stringify({ rating, comment }),
                    success: function () {
                        $('#modal-review-message').html('<div class="alert alert-success">Review submitted!</div>');
                        $('#modal-review-form')[0].reset();
                        loadModalReviews(productId, canReview);
                    },
                    error: function (xhr) {
                        let msg = 'Failed to submit review.';
                        if (xhr.responseJSON && xhr.responseJSON.error) msg += ' ' + xhr.responseJSON.error;
                        $('#modal-review-message').html('<div class="alert alert-danger">' + msg + '</div>');
                    }
                });
            });
        } else if (token && !canReview) {
            $('#modal-add-review-section').html('<div class="alert alert-info">You can only review this product after your order is <b>completed</b>.</div>');
        } else {
            $('#modal-add-review-section').html('<div class="alert alert-info">Log in to add a review.</div>');
        }
    });
}

// --- AUTOCOMPLETE SEARCH ---
$(document).ready(function() {
    // Initialize the page
    loadCategoriesForFilter();
    loadProductsWithFilters();
    updateCartCount();
    
    // On filter form submit
    $(document).on('submit', '#product-filter-form', function(e) {
        e.preventDefault();
        loadProductsWithFilters();
    });
    
    // On clear filters
    $(document).on('click', '#clear-filters-btn', function() {
        $('#product-filter-form')[0].reset();
        $('.filter-category-checkbox').prop('checked', false);
        $('#search-box').val('');
        $('#filter-sort').val('');
        loadProductsWithFilters();
    });
    
    // Also reload products when a filter checkbox is changed
    $(document).on('change', '.filter-category-checkbox', function() {
        loadProductsWithFilters();
    });
    
    // Handle sort dropdown change
    $('#filter-sort').on('change', function() {
        loadProductsWithFilters();
    });
    
    // Real-time filtering for price inputs
    $('#filter-min-price, #filter-max-price').on('input', function() {
        // Add a small delay to avoid too many requests
        clearTimeout(window.priceFilterTimeout);
        window.priceFilterTimeout = setTimeout(function() {
            loadProductsWithFilters();
        }, 500);
    });
    
    // Handle search button click
    $('#search-btn').on('click', function() {
        const query = $('#search-box').val().trim();
        if (query.length > 0) {
            loadProductsWithFilters();
            $('#search-autocomplete').empty().hide();
        }
    });
    
    // Handle Enter key in search box
    $('#search-box').on('keypress', function(e) {
        if (e.which === 13) {
            e.preventDefault();
            const query = $(this).val().trim();
            if (query.length > 0) {
                loadProductsWithFilters();
                $('#search-autocomplete').empty().hide();
            }
        }
    });
    
    let searchTimeout;
    $('#search-box').on('input', function() {
        clearTimeout(searchTimeout);
        const query = $(this).val().trim();
        if (query.length < 2) {
            $('#search-autocomplete').empty().hide();
            return;
        }
        searchTimeout = setTimeout(() => {
            $.get(`${API_BASE}/items`, { search: query }, function(data) {
                let html = '';
                if (data.products && data.products.length) {
                    data.products.slice(0, 5).forEach(item => {
                        html += `<a href="#" class="list-group-item list-group-item-action py-2" data-id="${item.id}">${item.name} <small class="text-muted">₱${item.price}</small></a>`;
                    });
                } else {
                    html = '<div class="list-group-item py-2">No results found</div>';
                }
                $('#search-autocomplete').html(html).show();
            }).fail(function() {
                $('#search-autocomplete').html('<div class="list-group-item py-2">Error searching</div>').show();
            });
        }, 300);
    });
    
    // Hide autocomplete when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('#search-box, #search-autocomplete').length) {
            $('#search-autocomplete').empty().hide();
        }
    });

    // When an autocomplete item is clicked
    $(document).on('click', '#search-autocomplete a', function(e) {
        e.preventDefault();
        const productId = $(this).data('id');
        $('#search-box').val($(this).text().split(' ₱')[0]);
        $('#search-autocomplete').empty().hide();
        showProductDetails(productId);
    });
    
    // Handle add to cart from details modal
    $(document).on('click', '#detailsAddToCart', function () {
        const qty = parseInt($("#detailsQty").val());
        const id = $("#detailsItemId").val();
        const name = $("#productDetailsModalLabel").text();
        const price = $("#productDetailsModalBody strong").text().replace(/[^\d.]/g, '');
        const image = $("#productDetailsModalBody img").attr('src');
        const stock = parseInt($("#productDetailsModalBody p:contains('Stock')").text().replace(/[^\d]/g, ''));
        const user_id = getUserId();
        if (!user_id) {
            alert('Please log in to add to cart.');
            window.location = 'login.html';
            return;
        }
        let cart = getCart();
        let existing = cart.find(item => item.id == id);
        if (existing) {
            existing.quantity += qty;
        } else {
            cart.push({
                id: id,
                name: name,
                price: parseFloat(price),
                image: image,
                stock: stock,
                quantity: qty
            });
        }
        saveCart(cart);
        $('#productDetailsModal').modal('hide');
        // Add to backend cart
        $.ajax({
            url: `${API_BASE}/cart/add`,
            method: 'POST',
            contentType: 'application/json',
            headers: getAuthHeader(),
            data: JSON.stringify({ product_id: id, quantity: qty, user_id }),
            success: function (res) {
                $("body").prepend('<div class="alert alert-success text-center" id="cartAddSuccess">Product added successfully!</div>');
                setTimeout(function() { $('#cartAddSuccess').fadeOut(); }, 2000);
                updateCartCount();
            },
            error: function (xhr) {
                $("body").prepend('<div class="alert alert-danger text-center" id="cartAddFail">Failed to add to cart!</div>');
                setTimeout(function() { $('#cartAddFail').fadeOut(); }, 2000);
            }
        });
    });
});