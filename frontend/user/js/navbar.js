// Dynamically update navbar profile/login/register links based on login state
$(document).ready(function () {
    function updateNavbarAuthLinks() {
        const userId = localStorage.getItem('user_id');
        let profileLink = '<li class="nav-item"><a class="nav-link" href="profile.html"><span class="fa fa-user mr-1"></span>Profile</a></li>';
        let loginLinks = '<li class="nav-item"><a class="nav-link" href="login.html"><span class="fa fa-sign-in mr-1"></span>Login</a></li>' +
                         '<li class="nav-item"><a class="nav-link" href="register.html"><span class="fa fa-user-plus mr-1"></span>Register</a></li>';
        // Remove existing profile/login/register links
        $(".navbar-nav .nav-item:has(a[href='profile.html']), .navbar-nav .nav-item:has(a[href='login.html']), .navbar-nav .nav-item:has(a[href='register.html'])").remove();
        if (userId) {
            // Show Profile
            $(".navbar-nav").append(profileLink);
        } else {
            // Show Login/Register
            $(".navbar-nav").append(loginLinks);
        }
    }
    updateNavbarAuthLinks();
});

// Fix logo path for backend-served images
$(function() {
  $(".navbar-brand img").attr("src", "/images/2nds2-1749609281777-740576861.png");
});
