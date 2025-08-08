// Use existing API_BASE or create it if it doesn't exist
window.API_BASE = window.API_BASE || window.API_BASE_URL || 'http://localhost:3000/api/v1';

// Load categories in the navbar dropdown
function loadNavCategories() {
    $.get(`${API_BASE}/categories`, function(data) {
        let html = '';
        if (data.categories && data.categories.length) {
            data.categories.forEach(cat => {
                html += `<li>
                    <a class="dropdown-item" href="#" onclick="handleCategorySelect(${cat.id}); return false;">
                        ${cat.name}
                    </a>
                </li>`;
            });
            html += '<li><hr class="dropdown-divider"></li>';
            html += '<li><a class="dropdown-item" href="#" onclick="handleCategorySelect(\'all\'); return false;">All Categories</a></li>';
        }
        $('#nav-categories-menu').html(html);
    });
}

// Handle search from navbar (desktop)
function handleNavSearch() {
    const searchQuery = $('#nav-search-box').val().trim();
    if (searchQuery.length > 0) {
        // Update search box in filter section
        $('#search-box').val(searchQuery);
        // Trigger the product filter
        if (typeof loadProductsWithFilters === 'function') {
            loadProductsWithFilters();
        } else {
            window.location.href = `home.html?search=${encodeURIComponent(searchQuery)}`;
        }
        // Clear navbar search
        $('#nav-search-box').val('');
        $('#nav-search-autocomplete').empty().hide();
    }
}

// Handle search from navbar (mobile)
function handleNavSearchMobile() {
    const searchQuery = $('#nav-search-box-mobile').val().trim();
    if (searchQuery.length > 0) {
        // Update search box in filter section
        $('#search-box').val(searchQuery);
        // Trigger the product filter
        if (typeof loadProductsWithFilters === 'function') {
            loadProductsWithFilters();
        } else {
            window.location.href = `home.html?search=${encodeURIComponent(searchQuery)}`;
        }
        // Clear navbar search
        $('#nav-search-box-mobile').val('');
        $('#nav-search-autocomplete-mobile').empty().hide();
    }
}

// Handle category selection from navbar
function handleCategorySelect(categoryId) {
    if (typeof loadProductsWithFilters === 'function') {
        // Uncheck all categories first
        $('.filter-category-checkbox').prop('checked', false);
        
        if (categoryId !== 'all') {
            // Check the selected category in the filter sidebar
            $(`#cat-${categoryId}`).prop('checked', true);
        }
        
        // Trigger the product filter
        loadProductsWithFilters();
    } else {
        // If we're not on the home page, redirect
        window.location.href = categoryId === 'all' ? 'home.html' : `home.html?category=${categoryId}`;
    }
}

// Dynamically update navbar search with autocomplete
function setupNavbarSearch() {
    let searchTimeout;
    
    $('#nav-search-box, #nav-search-box-mobile').on('input', function() {
        const $searchBox = $(this);
        const $autocompleteId = $searchBox.attr('id') === 'nav-search-box' ? 'nav-search-autocomplete' : 'nav-search-autocomplete-mobile';
        
        clearTimeout(searchTimeout);
        const query = $searchBox.val().trim();
        
        if (query.length < 2) {
            $(`#${$autocompleteId}`).empty().hide();
            return;
        }
        
        searchTimeout = setTimeout(() => {
            $.get(`${API_BASE}/items`, { search: query }, function(data) {
                let html = '';
                if (data.products && data.products.length) {
                    data.products.slice(0, 5).forEach(item => {
                        html += `<a href="#" class="list-group-item list-group-item-action py-2" data-id="${item.id}">
                            ${item.name} <small class="text-muted">₱${item.price}</small>
                        </a>`;
                    });
                } else {
                    html = '<div class="list-group-item py-2">No results found</div>';
                }
                $(`#${$autocompleteId}`).html(html).show();
            });
        }, 300);
    });

    // Handle autocomplete item click
    $(document).on('click', '#nav-search-autocomplete a, #nav-search-autocomplete-mobile a', function(e) {
        e.preventDefault();
        const productId = $(this).data('id');
        if (typeof showProductDetails === 'function') {
            showProductDetails(productId);
            $('#nav-search-box, #nav-search-box-mobile').val('');
            $('#nav-search-autocomplete, #nav-search-autocomplete-mobile').empty().hide();
        } else {
            window.location.href = `home.html?product=${productId}`;
        }
    });

    // Hide autocomplete when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.nav-search-container').length) {
            $('#nav-search-autocomplete, #nav-search-autocomplete-mobile').empty().hide();
        }
    });
}

// Initialize navbar functionality
$(document).ready(function() {
    // Load categories in the dropdown
    loadNavCategories();
    
    // Setup navbar search
    setupNavbarSearch();
    
    // Handle enter key in search boxes
    $('#nav-search-box, #nav-search-box-mobile').on('keypress', function(e) {
        if (e.which === 13) {
            e.preventDefault();
            if ($(this).attr('id') === 'nav-search-box') {
                handleNavSearch();
            } else {
                handleNavSearchMobile();
            }
        }
    });

    // Update auth links
    function updateNavbarAuthLinks() {
        const userId = localStorage.getItem('user_id');
        let profileLink = '<li class="nav-item"><a class="nav-link text-white px-3" href="profile.html"><i class="fa-solid fa-user me-1"></i>Profile</a></li>';
        let loginLinks = '<li class="nav-item"><a class="nav-link text-white px-3" href="login.html"><i class="fa-solid fa-right-to-bracket me-1"></i>Login</a></li>' +
                        '<li class="nav-item"><a class="nav-link text-white px-3" href="register.html"><i class="fa-solid fa-user-plus me-1"></i>Register</a></li>';
        
        $(".navbar-nav .nav-item:has(a[href='profile.html']), .navbar-nav .nav-item:has(a[href='login.html']), .navbar-nav .nav-item:has(a[href='register.html'])").remove();
        const cartNavItem = $(".navbar-nav .nav-item:has(a[href='cart.html'])");
        
        if (userId !== null && userId !== '') {
            $(".navbar-nav").append(profileLink);
            cartNavItem.show();
        } else {
            $(".navbar-nav").append(loginLinks);
            cartNavItem.hide();
        }
    }
    updateNavbarAuthLinks();

    // Fix logo path for backend-served images if needed
    const $logoImg = $(".navbar-brand img");
    if ($logoImg.length && $logoImg.attr("src") && !$logoImg.attr("src").startsWith('http')) {
        $logoImg.attr("src", "/images/2nds2-1749609281777-740576861.png");
    }
});
