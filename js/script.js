let currentUser = null;
let allProducts = [];
let currentCategory = 'all';
let cart = [];
let favorites = [];
let selectedImages = [];

function showToast(message, type) {
    const existing = document.querySelector('.custom-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    let icon = type === 'success' ? '<i class="fas fa-check-circle"></i>' : type === 'error' ? '<i class="fas fa-exclamation-circle"></i>' : '<i class="fas fa-info-circle"></i>';
    toast.innerHTML = `<div class="toast-content ${type}">${icon}<div class="toast-message">${message}</div></div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function openPopup(id) {
    const popup = document.getElementById(id);
    if (popup) popup.style.display = 'flex';
}

function closePopup(id) {
    const popup = document.getElementById(id);
    if (popup) popup.style.display = 'none';
}

// ========== ФУНКЦИЯ ВХОДА ==========
function login() {
    console.log('login() вызвана!');
    
    const loginName = document.getElementById('loginName').value.trim();
    const loginPassword = document.getElementById('loginPassword').value;
    
    if (!loginName || !loginPassword) {
        showToast('Заполните все поля', 'error');
        return;
    }
    
    const loginBtn = document.getElementById('loginSubmitBtn');
    const originalText = loginBtn ? loginBtn.innerHTML : 'Войти';
    if (loginBtn) {
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';
        loginBtn.disabled = true;
    }
    
    const formData = new FormData();
    formData.append('loginName', loginName);
    formData.append('loginPassword', loginPassword);
    
    fetch('login.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        console.log('Ответ от сервера:', data);
        
        if (loginBtn) {
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
        }
        
        if (data.startsWith('success')) {
            const parts = data.split('|');
            currentUser = {
                id: parts[1] || 1,
                name: parts[2] || loginName,
                email: parts[3] || ''
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            document.getElementById('authButtons').style.display = 'none';
            document.getElementById('userPanel').style.display = 'flex';
            
            const isAdmin = currentUser.name === 'admin';
            const adminBtn = document.getElementById('adminBtn');
            if (adminBtn) adminBtn.style.display = isAdmin ? 'flex' : 'none';
            
            closePopup('loginPopup');
            
            document.getElementById('loginName').value = '';
            document.getElementById('loginPassword').value = '';
            
            showToast(`Добро пожаловать, ${currentUser.name}!`, 'success');
            
            loadCart();
            loadFavorites();
            displayProducts();
        } else if (data === 'wrong_password') {
            showToast('Неверный пароль', 'error');
        } else if (data === 'user_not_found') {
            showToast('Пользователь не найден', 'error');
        } else {
            showToast('Ошибка: ' + data, 'error');
        }
    })
    .catch(error => {
        console.error('Ошибка fetch:', error);
        if (loginBtn) {
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
        }
        showToast('Ошибка соединения с сервером', 'error');
    });
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    cart = [];
    favorites = [];
    
    document.getElementById('authButtons').style.display = 'flex';
    document.getElementById('userPanel').style.display = 'none';
    
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) adminBtn.style.display = 'none';
    
    closePopup('profilePopup');
    showToast('Вы вышли из аккаунта', 'info');
    
    displayProducts();
    updateCartCount();
    updateFavoriteCount();
}

function getCartKey() { 
    return currentUser ? `cart_${currentUser.id}` : 'cart_guest'; 
}

function getFavoritesKey() { 
    return currentUser ? `favorites_${currentUser.id}` : 'favorites_guest'; 
}

function loadCart() {
    const saved = localStorage.getItem(getCartKey());
    cart = saved ? JSON.parse(saved) : [];
    updateCartCount();
}

function saveCart() {
    localStorage.setItem(getCartKey(), JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const count = cart.reduce((s, i) => s + i.quantity, 0);
    const cartCount = document.getElementById('cartCount');
    if (cartCount) cartCount.textContent = count;
}

function loadFavorites() {
    const saved = localStorage.getItem(getFavoritesKey());
    favorites = saved ? JSON.parse(saved) : [];
    updateFavoriteCount();
}

function saveFavorites() {
    localStorage.setItem(getFavoritesKey(), JSON.stringify(favorites));
    updateFavoriteCount();
}

function updateFavoriteCount() {
    const favCount = document.getElementById('favoriteCount');
    if (favCount) favCount.textContent = favorites.length;
}

function toggleFavorite(productId) {
    if (!currentUser) {
        showToast('Войдите в аккаунт', 'error');
        openPopup('loginPopup');
        return;
    }
    const idx = favorites.indexOf(productId);
    if (idx === -1) {
        favorites.push(productId);
        showToast('Добавлено в избранное', 'success');
    } else {
        favorites.splice(idx, 1);
        showToast('Удалено из избранного', 'info');
    }
    saveFavorites();
    displayProducts();
}

function filterByCategory(category, btn) {
    currentCategory = category;
    document.querySelectorAll('.filter-category-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    displayProducts();
}

function clearAllFilters() {
    currentCategory = 'all';
    document.querySelectorAll('.filter-category-btn').forEach(b => b.classList.remove('active'));
    const allBtn = document.querySelector('.filter-category-btn[data-category="all"]');
    if (allBtn) allBtn.classList.add('active');
    displayProducts();
}

function useLocalProducts() {
    allProducts = [
        { id: 1, name: "Awax Demon Friend Hoodie", price: 5000, image_front: "images/Awax Demon Friend Hoodie.jpg", category: "hoodie" },
        { id: 2, name: "Evil Eye Skeleton Hoodie", price: 6000, image_front: "images/Evil Eye Skeleton Hoodie.jpg", category: "hoodie" },
        { id: 3, name: "Graffiti Wave Jeans", price: 5000, image_front: "images/Graffiti Wave Jeans.jpg", category: "jeans" },
        { id: 4, name: "Mystic Bloom Joggers", price: 4500, image_front: "images/Mystic Bloom Joggers.jpg", category: "joggers" },
        { id: 5, name: "Occult Edge Sweatpants", price: 3000, image_front: "images/Occult Edge Sweatpants.jpg", category: "joggers" },
        { id: 6, name: "Shadow Rat Stealth Tee", price: 5700, image_front: "images/Shadow Rat Stealth Tee.jpg", category: "tee" }
    ];
    displayProducts();
}

function displayProducts() {
    let filtered = currentCategory === 'all' ? allProducts : allProducts.filter(p => p.category === currentCategory);
    const container = document.getElementById('products');
    const countSpan = document.getElementById('productsCount');
    
    if (!container) return;
    
    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-search"></i><p>Товары не найдены</p></div>`;
        if (countSpan) countSpan.textContent = `Найдено: 0 товаров`;
        return;
    }
    
    if (countSpan) countSpan.textContent = `Найдено: ${filtered.length} товаров`;
    container.innerHTML = '';
    
    for (let i = 0; i < filtered.length; i++) {
        const product = filtered[i];
        const isFav = favorites.includes(product.id);
        const img = product.image_front || 'images/placeholder.jpg';
        
        const div = document.createElement('div');
        div.className = 'product';
        div.setAttribute('data-product-id', product.id);
        div.innerHTML = `
            <div class="product-image-container" onclick="window.location.href='product.html?id=${product.id}'">
                <img src="${img}" alt="${product.name}" onerror="this.src='https://placehold.co/300x300?text=No+Image'">
                <button class="favorite-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite(${product.id})">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="product-info">
                <p>${escapeHtml(product.name)}</p>
                <p class="price">${Number(product.price).toLocaleString()} руб.</p>
            </div>
        `;
        container.appendChild(div);
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function checkAuth() {
    const user = localStorage.getItem('currentUser');
    const adminBtn = document.getElementById('adminBtn');
    
    if (user) {
        try {
            currentUser = JSON.parse(user);
            const isAdmin = currentUser.name === 'admin';
            
            document.getElementById('authButtons').style.display = 'none';
            document.getElementById('userPanel').style.display = 'flex';
            
            // Только эта строка отвечает за админ-кнопку
            if (adminBtn) {
                adminBtn.style.display = isAdmin ? 'flex' : 'none';
            }
            
            loadCart();
            loadFavorites();
        } catch(e) {
            console.error('Ошибка:', e);
            currentUser = null;
        }
    } else {
        currentUser = null;
        document.getElementById('authButtons').style.display = 'flex';
        document.getElementById('userPanel').style.display = 'none';
        if (adminBtn) adminBtn.style.display = 'none';
        loadCart();
        loadFavorites();
    }
}

function scrollToCatalog() {
    const catalog = document.getElementById('catalog');
    if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
}

function openCustomOrderPopup() {
    if (!currentUser) {
        showToast('Войдите в аккаунт', 'error');
        openPopup('loginPopup');
        return;
    }
    openPopup('customOrderPopup');
}

function selectGarment(garment, btn) {
    document.getElementById('selectedGarment').value = garment;
    document.querySelectorAll('.garment-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function loadReviews() {
    const reviews = [
        { name: "Анна С.", rating: 5, text: "Отличное качество! Очень довольна покупкой.", avatar: "https://placehold.co/60x60?text=AS" },
        { name: "Дмитрий П.", rating: 5, text: "Дизайн просто огонь! Заказал второй худи.", avatar: "https://placehold.co/60x60?text=DP" },
        { name: "Екатерина М.", rating: 5, text: "Футболка супер! Качество печати отличное.", avatar: "https://placehold.co/60x60?text=EM" }
    ];
    const container = document.getElementById('reviewsList');
    if (container) {
        container.innerHTML = reviews.map(r => `
            <div class="review-item">
                <img src="${r.avatar}" class="review-avatar" alt="${r.name}">
                <div class="review-content">
                    <h4>${escapeHtml(r.name)}</h4>
                    <div class="review-rating">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
                    <p class="review-text">${escapeHtml(r.text)}</p>
                </div>
            </div>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница загружена');
    checkAuth();
    useLocalProducts();
    loadReviews();
    
    const sizeSelect = document.getElementById('sizeSelect');
    if (sizeSelect) {
        sizeSelect.addEventListener('change', function() {
            const customSize = document.getElementById('customSize');
            if (customSize) {
                customSize.style.display = this.value === 'custom' ? 'block' : 'none';
            }
        });
    }
});