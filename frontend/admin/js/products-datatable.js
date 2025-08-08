// products-datatable.js - DataTable initialization and management
$(document).ready(function () {
    const token = localStorage.getItem('token');

    // Function to show notifications
    function showNotification(message, type = 'success') {
        const toast = $('#notificationToast');
        const toastBody = toast.find('.toast-body');
        
        toast.removeClass('bg-success bg-danger bg-warning');
        toast.addClass(`bg-${type} text-white`);
        toastBody.text(message);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }

    // Check authentication
    function checkAuth() {
        const authToken = localStorage.getItem('token');
        const userRole = localStorage.getItem('role');

        if (!authToken || !userRole) {
            location.href = "../../status_pages/401.html";
            return false;
        }
        
        if (userRole !== 'admin') {
            location.href = '../../status_pages/403.html';
            return false;
        }
        
        return true;
        $.ajax({
            url: `${window.API_BASE}/auth/verify`,
            headers: { 'Authorization': 'Bearer ' + authToken },
            method: 'GET',
            async: false,
            error: function() {
                console.error('Invalid or expired token');
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                location.href = "../../status_pages/401.html";
                return false;
            }
        });
        
        return true;
    }

    // Exit if not authenticated
    if (!checkAuth()) return;

    const API_BASE = window.API_BASE || '/api/v1';
    let isInfinite = false;
    let page = 1;
    let pageSize = 10;
    let loading = false;
    let reachedEnd = false;
    let allProducts = [];
    let table;
    let imagesToRemove = [];

 
    function productToRow(product) {
        let imagesHtml = '';
        if (product.images && product.images.length) {
            imagesHtml = '<div class="product-img-list">' + product.images.map(imgObj => {
                const img = imgObj.path; // Access the path property
                // If path is null or undefined, use default image
                if (!img) {
                    return `<img src="/images/no-image.svg" class="product-img-thumb">`;
                }
                
                // If path already starts with http:// or https://, return as is
                if (/^https?:\/\//.test(img)) {
                    return `<img src="${img}" class="product-img-thumb">`;
                }
                
                // If path starts with /, it's already a full path
                if (img.startsWith('/')) {
                    return `<img src="${img}" class="product-img-thumb">`;
                }
                
                // If path includes 'products/', it's a relative path
                if (img.includes('products/')) {
                    return `<img src="/images/${img}" class="product-img-thumb">`;
                } else {
                    // Otherwise, assume it's a product image in the products folder
                    return `<img src="/images/products/${img}" class="product-img-thumb">`;
                }
            }).join('') + '</div>';
        }
        return {
            id: product.id,
            name: product.name,
            price: `₱${Number(product.price).toFixed(2)}`,
            stock: product.stock,
            category: product.category_name || 'N/A',
            imagesHtml,
            actions: `
                <div class="d-flex gap-2">
                    <button class='btn btn-sm btn-primary edit-product' data-id='${product.id}'>
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class='btn btn-sm btn-danger delete-product' data-id='${product.id}'>
                        <i class="bi bi-trash"></i>
                    </button>
                </div>`
        };
    }

    function fetchProducts(page = 1, append = false) {
        loading = true;
        let url = `${API_BASE}/items?page=${page}&limit=${pageSize}`;
        $.ajax({
            url,
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
            success: function (res) {
                let rows = (res.products || res.items || []).map(productToRow);
                if (!table) {
                    initTable(rows);
                } else if (isInfinite) {
                    if (append) {
                        // Prevent duplicate products by ID when infinite scrolling (fix for backend pagination overlap)
                        const existingIds = new Set(allProducts.map(p => p.id));
                        rows = rows.filter(p => !existingIds.has(p.id));
                        allProducts = allProducts.concat(rows);
                        // Remove any accidental duplicates by ID (in case backend returns overlapping pages)
                        const unique = {};
                        allProducts.forEach(p => { unique[p.id] = p; });
                        allProducts = Object.values(unique);
                    } else {
                        allProducts = rows;
                    }
                    table.clear().rows.add(allProducts).draw(false);
                    if (rows.length < pageSize) reachedEnd = true;
                } else {
                    allProducts = rows;
                    table.clear().rows.add(rows).draw();
                }
                loading = false;
            },
            error: function () { loading = false; }
        });
    }

    function initTable(rows) {
        table = $('#productsTable').DataTable({
            data: rows,
            columns: [
                { data: 'id' },
                { data: 'name' },
                { data: 'price' },
                { data: 'stock' },
                { data: 'category' },
                { data: 'imagesHtml' },
                { data: 'actions' }
            ],
            paging: !isInfinite,
            searching: true,
            info: true,
            ordering: true,
            autoWidth: false,
            destroy: true,
            lengthChange: true
        });
    }

    function loadCategories(selectedId, cb) {
        console.log('loadCategories called with selectedId:', selectedId);
        $.get('/api/v1/categories', function (res) {
            const $cat = $('#productCategory');
            $cat.empty();
            $cat.append('<option value="">Select Category</option>');
            console.log('Categories loaded:', res.categories);
            (res.categories || []).forEach(cat => {
                console.log(`Option value: ${cat.id} (type: ${typeof cat.id}), Selected ID: ${selectedId} (type: ${typeof selectedId})`);
                $cat.append(`<option value="${cat.id}"${selectedId == cat.id ? ' selected' : ''}>${cat.name}</option>`);
            });
            if (selectedId) {
                $cat.val(selectedId);
                console.log('Dropdown value set to:', $cat.val());
            }
            if (cb) cb();
        });
    }

    // Initial load
    fetchProducts(1);

    // Toggle pagination/infinite
    $('#loadPaginated').on('click', function () {
        isInfinite = false;
        page = 1;
        reachedEnd = false;
        $('#infinite-loader').hide();
        if (table) {
            table.destroy();
            table = null;
        }
        allProducts = [];
        fetchProducts(1);
    });
    $('#loadInfinite').on('click', function () {
        isInfinite = true;
        page = 1;
        reachedEnd = false;
        if (table) {
            table.destroy();
            table = null;
        }
        allProducts = [];
        fetchProducts(1);
        $('#infinite-loader').show();
    });

    // Infinite scroll
    $(window).on('scroll', function () {
        if (!isInfinite || loading || reachedEnd) return;
        if ($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
            page++;
            fetchProducts(page, true);
        }
    });

    // Add Product Modal
    $('#addProductBtn').on('click', function () {
        // Reset form and clear values
        $('#productForm')[0].reset();
        const fileInput = document.getElementById('productImages');
        if (fileInput) {
            fileInput.value = ''; // Clear file input
        }
        
        $('#productModalTitle').text('Add Product');
        $('#productModalHeader').removeClass('edit-mode');
        $('#productId').val('');
        $('#productImagePreview').empty();
        
        // Enable required fields for add
        $('#productForm input:not([type="file"]), #productForm select, #productForm textarea').attr('required', true);
        
        loadCategories();
        imagesToRemove = []; // Reset on add new product
        $('#productImagesLabel').text('Upload Product Images'); // Set default text for add mode
        
        // Show modal using Bootstrap modal method
        const productModal = new bootstrap.Modal($('#productModal'));
        productModal.show();
    });
    
    // Modal close handling
    $('#closeProductModal, .modal-close').on('click', function () {
        const productModal = bootstrap.Modal.getInstance($('#productModal'));
        if (productModal) {
            productModal.hide();
            imagesToRemove = []; // Reset on close
        }
    });

    // Image preview handling
    $('#productImages').on('change', function () {
        const files = Array.from(this.files);
        
        // Validate all files first
        for (const file of files) {
            if (!file.type.match('image.*')) {
                showNotification('Please upload only image files', 'danger');
                this.value = ''; // Clear the input
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                showNotification('Image size should not exceed 5MB', 'danger');
                this.value = ''; // Clear the input
                return;
            }
        }
        
        // All files are valid, show previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const previewItem = $(`
                    <div class="image-preview-item">
                        <img src="${e.target.result}" class="product-img-thumb">
                        <button type="button" class="btn btn-sm btn-danger remove-image-btn">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                `);
                $('#productImagePreview').append(previewItem);
                
                // Add click handler for the remove button
                previewItem.find('.remove-image-btn').on('click', function() {
                    previewItem.remove();
                });
            };
            reader.readAsDataURL(file);
        });
    });

    // Save product (add/edit)
    $('#productForm').on('submit', function (e) {
        e.preventDefault();
        
        // Basic validation
        const name = $('#productName').val().trim();
        const price = parseFloat($('#productPrice').val());
        const stock = parseInt($('#productStock').val());
        const description = $('#productDescription').val().trim();
        const category_id = $('#productCategory').val();
        
        if (!name || !price || stock === undefined || !description || !category_id) {
            showNotification('Please fill out all required fields', 'danger');
            return;
        }
        
        if (price <= 0) {
            showNotification('Price must be greater than 0', 'danger');
            return;
        }
        
        if (stock < 0) {
            showNotification('Stock cannot be negative', 'danger');
            return;
        }

        // Create FormData object
        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('stock', stock);
        formData.append('description', description);
        formData.append('category_id', category_id);
        
        // Get selected files from the file input
        const fileInput = document.getElementById('productImages');
        if (fileInput && fileInput.files) {
            const files = fileInput.files;
            // Add images if any were selected
            for (let i = 0; i < files.length; i++) {
                formData.append('images', files[i]);
            }
        }
        
        // Handle existing product edit
        const id = $('#productId').val();
        if (id) {
            // Add removed images list if any
            if (imagesToRemove && imagesToRemove.length) {
                formData.append('imagesToRemove', JSON.stringify(imagesToRemove));
            }
            // If no new images uploaded but there are existing ones
            if ((!fileInput || !fileInput.files || fileInput.files.length === 0) && (!imagesToRemove || !imagesToRemove.length)) {
                formData.append('keepImages', 'true');
            }
        }

        // Make API call
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_BASE}/items/${id}` : `${API_BASE}/items`;
        
        $.ajax({
            url,
            method,
            headers: { 'Authorization': 'Bearer ' + token },
            processData: false,
            contentType: false,
            data: formData,
            success: function () {
                showNotification(`Product ${id ? 'updated' : 'created'} successfully`, 'success');
                const productModal = bootstrap.Modal.getInstance($('#productModal'));
                if (productModal) {
                    productModal.hide();
                }
                fetchProducts(1);
            },
            error: function (xhr) {
                const message = xhr.responseJSON?.error || 'Failed to save product';
                showNotification(message, 'danger');
            }
        });
    });

    // Handle image removal from preview
    $('#productImagePreview').on('click', '.remove-image-btn', function() {
        const imageItem = $(this).closest('.image-preview-item');
        const imageId = imageItem.data('image-id');
        if (imageId) {
            imagesToRemove.push(imageId);
        }
        imageItem.remove();
    });

    // Edit product
    $('#productsTable').on('click', '.edit-product', function () {
        const id = $(this).data('id');
        $.ajax({
            url: `${API_BASE}/items/${id}`,
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
            success: function (res) {
                const product = res.product || res;
                if (!product) {
                    showNotification('Could not find product details', 'danger');
                    return;
                }
                
                // Reset form and imagesToRemove array
                $('#productForm')[0].reset();
                imagesToRemove = [];
                
                // Set modal title and form data
                $('#productModalTitle').text(`Edit Product (ID: ${product.id})`);
                $('#productModalHeader').addClass('edit-mode');
                $('#productId').val(product.id);
                $('#productName').val(product.name);
                $('#productPrice').val(product.price);
                $('#productStock').val(product.stock);
                $('#productDescription').val(product.description);
                
                // Load categories and set selected
                loadCategories(product.category_id);

                // Display existing images with remove buttons
                $('#productImagePreview').empty();
                if (product.images && product.images.length > 0) {
                    product.images.forEach(imgObj => {
                        const imgPath = imgObj.path;
                        const imgId = imgObj.id;
                        if (imgPath) {
                            $('#productImagePreview').append(`
                                <div class="image-preview-item" data-image-id="${imgId}">
                                    <img src="${imgPath}" class="product-img-thumb">
                                    <button type="button" class="btn btn-sm btn-danger remove-image-btn">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            `);
                        }
                    });
                    $('#productImagesLabel').text('Add More Images');
                } else {
                    $('#productImagesLabel').text('Upload Product Images');
                }
                
                // Show modal using Bootstrap modal method
                const productModal = new bootstrap.Modal($('#productModal'));
                productModal.show();
            },
            error: function (xhr) {
                const message = xhr.responseJSON?.error || 'Failed to load product details';
                showNotification(message, 'danger');
            }
        });
    });

    // Delete product
    $('#productsTable').on('click', '.delete-product', function () {
        const id = $(this).data('id');
        if (confirm('Are you sure you want to delete this product?')) {
            $.ajax({
                url: `${API_BASE}/items/${id}`,
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token },
                success: function () {
                    showNotification('Product deleted successfully', 'success');
                    fetchProducts(1);
                },
                error: function (xhr) {
                    const message = xhr.responseJSON?.error || 'Failed to delete product';
                    showNotification(message, 'danger');
                }
            });
        }
    });

})