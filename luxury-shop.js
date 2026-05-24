
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 1000, once: true, offset: 100, easing: 'ease-in-out' });
    }

    // 2. Preloader Logic
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        document.body.classList.add('loading');
        const fadeOutPreloader = () => {
            preloader.classList.add('fade-out');
            document.body.classList.remove('loading');
        };
        const fallbackTimeout = setTimeout(fadeOutPreloader, 3000);
        window.addEventListener('load', () => {
            clearTimeout(fallbackTimeout);
            setTimeout(fadeOutPreloader, 1000);
        });
    }

    // 3. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            if (document.querySelector('.hero') && !document.querySelector('.page-header')) {
                navbar.classList.remove('scrolled');
            }
        }
    });

    // 4. Mobile Menu Toggle
    const menuToggle = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
    }

    // --- CART SYSTEM ---
    let cart = JSON.parse(localStorage.getItem('aurum_cart')) || [];
    const cartBadge = document.querySelector('.cart-count');
    const cartDrawer = document.querySelector('.cart-drawer');
    const cartOverlay = document.querySelector('.cart-overlay');
    const cartTrigger = document.querySelector('.cart-trigger');
    const cartClose = document.querySelector('.cart-close');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalAmount = document.getElementById('cart-total-amount');

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartBadge) cartBadge.textContent = totalItems;
        localStorage.setItem('aurum_cart', JSON.stringify(cart));
        renderCartItems();
    }

    function renderCartItems() {
        if (!cartItemsContainer) return;
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your bag is currently empty.</div>';
            if (cartTotalAmount) cartTotalAmount.textContent = '$0';
            return;
        }
        let html = '';
        let total = 0;
        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            html += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <span class="cart-item-price">$${item.price.toLocaleString()}</span>
                        <div class="cart-item-qty">
                            <button class="qty-btn dec" data-index="${index}">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn inc" data-index="${index}">+</button>
                        </div>
                    </div>
                    <button class="remove-item" data-index="${index}"><i class="fa-solid fa-trash-can"></i></button>
                </div>`;
        });
        cartItemsContainer.innerHTML = html;
        if (cartTotalAmount) cartTotalAmount.textContent = `$${total.toLocaleString()}`;

        document.querySelectorAll('.qty-btn.inc').forEach(btn => btn.addEventListener('click', () => { cart[btn.dataset.index].quantity++; updateCartUI(); }));
        document.querySelectorAll('.qty-btn.dec').forEach(btn => btn.addEventListener('click', () => { 
            const idx = btn.dataset.index;
            if (cart[idx].quantity > 1) cart[idx].quantity--; else cart.splice(idx, 1);
            updateCartUI();
        }));
        document.querySelectorAll('.remove-item').forEach(btn => btn.addEventListener('click', () => { cart.splice(btn.dataset.index, 1); updateCartUI(); }));
    }

    if (cartTrigger) cartTrigger.addEventListener('click', (e) => { e.preventDefault(); cartDrawer.classList.add('active'); cartOverlay.classList.add('active'); document.body.style.overflow = 'hidden'; });
    if (cartClose) cartClose.addEventListener('click', () => { cartDrawer.classList.remove('active'); cartOverlay.classList.remove('active'); document.body.style.overflow = ''; });
    if (cartOverlay) cartOverlay.addEventListener('click', () => { cartDrawer.classList.remove('active'); cartOverlay.classList.remove('active'); document.body.style.overflow = ''; });

    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            const card = btn.closest('.product-item');
            const name = card.querySelector('.product-name').textContent;
            const price = parseInt(card.querySelector('.product-price').textContent.replace('$', '').replace(',', ''));
            const image = card.querySelector('img').src;
            const existing = cart.find(i => i.name === name);
            if (existing) existing.quantity++; else cart.push({ name, price, image, quantity: 1 });
            updateCartUI();
            btn.textContent = 'Added';
            setTimeout(() => { btn.textContent = 'Add to Bag'; cartDrawer.classList.add('active'); cartOverlay.classList.add('active'); }, 800);
        });
    });

    // --- SEARCH SYSTEM ---
    const searchTrigger = document.getElementById('search-trigger');
    const searchModal = document.getElementById('search-modal');
    const globalSearchInput = document.getElementById('global-search-input');
    
    if (searchTrigger) {
        searchTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            searchModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (globalSearchInput) setTimeout(() => globalSearchInput.focus(), 500);
        });
    }

    if (globalSearchInput) {
        globalSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = globalSearchInput.value.trim();
                if (query) window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
            }
        });
    }

    // --- AUTH SYSTEM ---
    const userTrigger = document.getElementById('user-trigger');
    const userModal = document.getElementById('user-modal');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const changePassForm = document.getElementById('change-pass-form');
    
    // Global Auth Functions
    window.switchAuthTab = (type) => {
        const tabs = document.querySelectorAll('.auth-tab');
        const submitBtn = document.querySelector('#login-form button');
        tabs.forEach(t => t.classList.toggle('active', t.textContent.toLowerCase() === type));
        submitBtn.textContent = type === 'login' ? 'Sign In' : 'Create Account';
    };

    window.showProfile = () => {
        document.getElementById('login-view').style.display = 'none';
        document.getElementById('password-view').style.display = 'none';
        document.getElementById('profile-view').style.display = 'block';
        document.getElementById('user-display-email').textContent = localStorage.getItem('aurum_user');
    };

    window.showChangePassword = () => {
        document.getElementById('profile-view').style.display = 'none';
        document.getElementById('password-view').style.display = 'block';
    };

    function checkAuth() {
        const user = localStorage.getItem('aurum_user');
        if (user) {
            if (userModal.classList.contains('active')) showProfile();
        } else {
            document.getElementById('login-view').style.display = 'block';
            document.getElementById('profile-view').style.display = 'none';
            document.getElementById('password-view').style.display = 'none';
        }
    }

    if (userTrigger) {
        userTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            userModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            checkAuth();
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const pass = document.getElementById('login-password').value;
            const isRegister = document.querySelector('.auth-tab.active').textContent === 'Register';

            if (isRegister) {
                localStorage.setItem(`user_${email}`, pass);
                alert('Account created successfully! You can now log in.');
                switchAuthTab('login');
            } else {
                const savedPass = localStorage.getItem(`user_${email}`);
                if (savedPass === pass) {
                    localStorage.setItem('aurum_user', email);
                    showProfile();
                } else {
                    alert('Invalid credentials.');
                }
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('aurum_user');
            location.reload();
        });
    }

    if (changePassForm) {
        changePassForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newPass = document.getElementById('new-password').value;
            const confirmPass = document.getElementById('confirm-password').value;
            if (newPass === confirmPass) {
                const email = localStorage.getItem('aurum_user');
                localStorage.setItem(`user_${email}`, newPass);
                alert('Password updated successfully.');
                showProfile();
            } else {
                alert('Passwords do not match.');
            }
        });
    }

    // Modal Close Logic
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
            document.body.style.overflow = '';
        });
    });

    // --- SHARED UTILS ---
    const products = document.querySelectorAll('.product-item');
    function applyFilter(val) {
        val = val.toLowerCase();
        products.forEach(p => {
            const name = p.querySelector('.product-name').textContent.toLowerCase();
            const cat = p.querySelector('.product-cat').textContent.toLowerCase();
            p.style.display = (val === 'all' || name.includes(val) || cat.includes(val)) ? 'block' : 'none';
        });
    }

    // Collection Cards
    document.querySelectorAll('.collection-card').forEach(c => {
        c.addEventListener('click', () => window.location.href = `luxury-boutique.html?category=${encodeURIComponent(c.dataset.category)}`);
    });

    // Product Card Click
    products.forEach(p => p.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart') || e.target.closest('.action-btn')) return;
        const name = p.querySelector('.product-name').textContent;
        const price = p.querySelector('.product-price').textContent;
        const image = p.querySelector('img').src;
        const cat = p.querySelector('.product-cat').textContent;
        window.location.href = `luxury-product.html?name=${encodeURIComponent(name)}&price=${encodeURIComponent(price)}&image=${encodeURIComponent(image)}&cat=${encodeURIComponent(cat)}`;
    }));

    updateCartUI();
});
