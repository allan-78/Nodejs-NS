const token = localStorage.getItem('token');
     const getRole = localStorage.getItem('role');

    if (!token || !getRole ){
        location.href="../../status_pages/401.html"
    }else{
          if (getRole !== 'admin') {
        location.href = '../../status_pages/403.html';
    }
    };


$(document).ready(function () {
    const API_BASE = '/api/v1';
    const token = localStorage.getItem('token');
    let table;


    function reviewToRow(review) {
        return {
            id: review.id,
            product: review.product_name,
            user: review.user_name,
            rating: review.rating,
            comment: review.comment,
            actions: `
                <div class="d-flex gap-2">
                    <button class='btn btn-sm btn-primary edit-review' data-id='${review.id}'>
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class='btn btn-sm btn-danger delete-review' data-id='${review.id}'>
                        <i class="bi bi-trash"></i>
                    </button>
                </div>`
        };
    }

    function fetchReviews() {
        $.ajax({
            url: `${API_BASE}/reviews`,
            headers: { 'Authorization': 'Bearer ' + token },
            success: function (res) {
                let rows = (res.reviews || []).map(reviewToRow);
                if (!table) {
                    initTable(rows);
                } else {
                    table.clear().rows.add(rows).draw();
                }
            },
            error: function (xhr, status, error) {
                console.error("Error fetching reviews:", error);
                alert("Failed to fetch reviews.");
            }
        });
    }

    function initTable(rows) {
        table = $('#reviewsTable').DataTable({
            data: rows,
            columns: [
                { data: 'id' },
                { data: 'product' },
                { data: 'user' },
                { 
                    data: 'rating',
                    render: function(data, type, row) {
                        if (type === 'display') {
                            let stars = '';
                            for (let i = 0; i < data; i++) {
                                stars += '<i class="fas fa-star text-warning"></i>';
                            }
                            for (let i = data; i < 5; i++) {
                                stars += '<i class="far fa-star text-warning"></i>';
                            }
                            return stars;
                        }
                        return data;
                    }
                },
                { data: 'comment' },
                { data: 'actions' }
            ],
            paging: true,
            searching: true,
            info: true,
            ordering: true,
            autoWidth: false,
            destroy: true,
            lengthChange: true,
            pageLength: 10,
            dom: "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
                 "<'row'<'col-sm-12'tr>>" +
                 "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            language: {
                search: "_INPUT_",
                searchPlaceholder: "Search reviews...",
                lengthMenu: "_MENU_ reviews per page",
                info: "Showing _START_ to _END_ of _TOTAL_ reviews",
                infoEmpty: "No reviews available",
                infoFiltered: "(filtered from _MAX_ total reviews)",
                paginate: {
                    first: '<i class="fas fa-angle-double-left"></i>',
                    previous: '<i class="fas fa-angle-left"></i>',
                    next: '<i class="fas fa-angle-right"></i>',
                    last: '<i class="fas fa-angle-double-right"></i>'
                }
            }
        });
    }

    // Initial load
    fetchReviews();

    function showNotification(message, type = 'success') {
        const toast = $('#notificationToast');
        const toastBody = toast.find('.toast-body');
        
        toast.removeClass('bg-success bg-danger bg-warning');
        toast.addClass(`bg-${type} text-white`);
        toastBody.text(message);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }

    // Add Review Modal
    $('#addReviewBtn').on('click', function () {
        $('#reviewModalTitle').text('Add Review');
        $('#reviewModalHeader').removeClass('bg-primary').addClass('bg-success');
        $('#reviewForm')[0].reset();
        $('#reviewId').val('');
        populateProductDropdown();
        populateUserDropdown();
        const modal = new bootstrap.Modal($('#reviewModal'));
        modal.show();
    });

    function populateProductDropdown(callback) {
        $.ajax({
            url: `${API_BASE}/products`,
            headers: { 'Authorization': 'Bearer ' + token },
            success: function (res) {
                const products = res.products || [];
                let options = '<option value="">Select Product</option>';
                products.forEach(product => {
                    options += `<option value="${product.id}">${product.name}</option>`;
                });
                $('#reviewProduct').html(options);
                if (callback) callback();
            },
            error: function (xhr, status, error) {
                console.error("Error fetching products:", error);
            }
        });
    }

    function populateUserDropdown(callback) {
        $.ajax({
            url: `${API_BASE}/users`,
            headers: { 'Authorization': 'Bearer ' + token },
            success: function (res) {
                const users = res.users || [];
                let options = '<option value="">Select User</option>';
                users.forEach(user => {
                    options += `<option value="${user.id}">${user.name}</option>`;
                });
                $('#reviewUser').html(options);
                if (callback) callback();
            },
            error: function (xhr, status, error) {
                console.error("Error fetching users:", error);
            }
        });
    }

    // Close Modal
    $('#closeReviewModal').on('click', function() {
        const modal = bootstrap.Modal.getInstance($('#reviewModal'));
        modal.hide();
    });

    // Save review (add/edit)
    $('#reviewForm').on('submit', function(e) {
        e.preventDefault();
        const id = $('#reviewId').val();
        const product = $('#reviewProduct').val();
        const user = $('#reviewUser').val();
        const rating = $('#reviewRating').val();
        const comment = $('#reviewComment').val();

        if (!product || !user || !rating || !comment) {
            showNotification('Please fill in all required fields.', 'warning');
            return;
        }

        let url = `${API_BASE}/reviews`;
        let method = 'POST';

        if (id) { // Editing
            url = `${API_BASE}/reviews/${id}`;
            method = 'PUT';
        }

        $.ajax({
            url: url,
            method: method,
            headers: { 'Authorization': 'Bearer ' + token },
            contentType: 'application/json',
            data: JSON.stringify({ product_id: product, user_id: user, rating: rating, comment: comment }),
            success: function(res) {
                const modal = bootstrap.Modal.getInstance($('#reviewModal'));
                modal.hide();
                showNotification(res.message || 'Review saved successfully', 'success');
                fetchReviews(); // Refresh table
            },
            error: function(xhr, status, error) {
                console.error("Error saving review:", error);
                showNotification("Failed to save review: " + 
                    (xhr.responseJSON ? (xhr.responseJSON.error || xhr.responseJSON.message) : ""), 'danger');
            }
        });
    });

    // Edit Review
    $(document).on('click', '.edit-review', function() {
        const id = $(this).data('id');
        $.ajax({
            url: `${API_BASE}/reviews/${id}`,
            headers: { 'Authorization': 'Bearer ' + token },
            success: function(res) {
                const review = res.review;
                if (review) {
                    $('#reviewModalTitle').text('Edit Review');
                    $('#reviewModalHeader').removeClass('bg-success').addClass('bg-primary');
                    $('#reviewId').val(review.id);
                    populateProductDropdown(() => {
                        $('#reviewProduct').val(review.product_id);
                    });
                    populateUserDropdown(() => {
                        $('#reviewUser').val(review.user_id);
                    });
                    $('#reviewRating').val(review.rating);
                    $('#reviewComment').val(review.comment);
                    
                    const modal = new bootstrap.Modal($('#reviewModal'));
                    modal.show();
                }
            },
            error: function(xhr, status, error) {
                console.error("Error fetching review for edit:", error);
                showNotification("Failed to load review for editing.", "danger");
            }
        });
    });

    // Delete Review
    $(document).on('click', '.delete-review', function() {
        const id = $(this).data('id');
        
        const confirmDelete = new Promise((resolve, reject) => {
            const confirmModal = `
                <div class="modal fade" id="confirmDeleteModal" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header bg-danger text-white">
                                <h5 class="modal-title">Confirm Delete</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <p>Are you sure you want to delete this review? This action cannot be undone.</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-danger" id="confirmDelete">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>`;
            
            $(confirmModal).appendTo('body');
            const modal = new bootstrap.Modal($('#confirmDeleteModal'));
            modal.show();
            
            $('#confirmDelete').on('click', function() {
                resolve(true);
                modal.hide();
                $('#confirmDeleteModal').remove();
            });
            
            $('#confirmDeleteModal').on('hidden.bs.modal', function() {
                resolve(false);
                $('#confirmDeleteModal').remove();
            });
        });
        
        confirmDelete.then((confirmed) => {
            if (confirmed) {
                $.ajax({
                    url: `${API_BASE}/reviews/${id}`,
                    method: 'DELETE',
                    headers: { 'Authorization': 'Bearer ' + token },
                    success: function(res) {
                        showNotification(res.message || "Review deleted successfully", "success");
                        fetchReviews(); // Refresh table
                    },
                    error: function(xhr, status, error) {
                        console.error("Error deleting review:", error);
                        showNotification("Failed to delete review: " + 
                            (xhr.responseJSON ? xhr.responseJSON.message : ""), "danger");
                    }
                });
            }
        });
    });

    // Initialize tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});