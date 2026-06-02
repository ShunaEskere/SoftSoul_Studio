// Глобальные переменные
let currentUser = null;
let userOrders = [];
let userCustomOrders = [];
let favorites = [];
let updateInterval = null;

// Создание частиц
function createParticles() {
    const bgAnimation = document.getElementById('bgAnimation');
    if (!bgAnimation) return;
    for (let i = 0; i < 80; i++) {
        const particle = document.createElement('span');
        const size = Math.random() * 40 + 10;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = Math.random() * 12 + 6 + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.opacity = Math.random() * 0.3 + 0.1;
        particle.style.background = `radial-gradient(circle, rgba(102,126,234,0.4) 0%, rgba(118,75,162,0.2) 100%)`;
        bgAnimation.appendChild(particle);
    }
}

function showNotification(message, type) {
    const notification = document.getElementById('notificationPopup');
    if (!notification) return;
    const messageElement = document.getElementById('notificationMessage');
    const icon = notification.querySelector('i');
    messageElement.textContent = message;
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
        icon.style.color = '#4caf50';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
        icon.style.color = '#f44336';
    } else {
        icon.className = 'fas fa-info-circle';
        icon.style.color = '#2196f3';
    }
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
}

function getStatusText(status, type = 'order') {
    if (type === 'design') {
        const statuses = { 'pending': 'В обработке', 'processing': 'В работе', 'completed': 'Выполнен', 'rejected': 'Отклонен' };
        return statuses[status] || status;
    } else {
        const statuses = { 'pending': 'В обработке', 'confirmed': 'Подтвержден', 'shipped': 'Отправлен', 'delivered': 'Доставлен', 'cancelled': 'Отменен' };
        return statuses[status] || status;
    }
}

// Ключ для избранного
function getFavoritesKey() {
    if (!currentUser) return 'favorites_guest';
    return `favorites_${currentUser.id}`;
}

function loadFavorites() {
    if (currentUser) {
        const favoritesKey = getFavoritesKey();
        const savedFavorites = localStorage.getItem(favoritesKey);
        favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
        updateFavoriteCount();
        displayFavorites();
    }
}

function saveFavorites() {
    if (currentUser) {
        const favoritesKey = getFavoritesKey();
        localStorage.setItem(favoritesKey, JSON.stringify(favorites));
        updateFavoriteCount();
    }
}

function updateFavoriteCount() {
    const favoriteCount = document.getElementById('favoriteCount');
    if (favoriteCount) favoriteCount.textContent = favorites.length;
}

function displayFavorites() {
    const allProducts = [
        { id: 1, name: "Awax Demon Friend Hoodie", price: 5000, images: ["images/Awax Demon Friend Hoodie.jpg"], description: "Уникальный худи с авторским принтом", category: "hoodie" },
        { id: 2, name: "Evil Eye Skeleton Hoodie", price: 6000, images: ["images/Evil Eye Skeleton Hoodie.jpg"], description: "Худи с дизайном 'Глаз скелета'", category: "hoodie" },
        { id: 3, name: "Graffiti Wave Jeans", price: 5000, images: ["images/Graffiti Wave Jeans.jpg"], description: "Джинсы с граффити-принтом", category: "jeans" },
        { id: 4, name: "Mystic Bloom Joggers", price: 4500, images: ["images/Mystic Bloom Joggers.jpg"], description: "Спортивные штаны с цветочным принтом", category: "joggers" },
        { id: 5, name: "Occult Edge Sweatpants", price: 3000, images: ["images/Occult Edge Sweatpants.jpg"], description: "Штаны с мистическим дизайном", category: "joggers" },
        { id: 6, name: "Shadow Rat Stealth Tee", price: 5700, images: ["images/Shadow Rat Stealth Tee.jpg"], description: "Футболка с дизайном 'Теневая крыса'", category: "tee" }
    ];
    
    const favoriteProducts = allProducts.filter(p => favorites.includes(p.id));
    const favoritesList = document.getElementById('favoritesList');
    
    if (!favoritesList) return;
    
    if (favoriteProducts.length === 0) {
        favoritesList.innerHTML = `
            <div class="empty-orders">
                <i class="fas fa-heart"></i>
                <p>У вас пока нет избранных товаров</p>
                <a href="Main.html#catalog" class="modern-btn outline">
                    <i class="fas fa-shopping-bag"></i> Перейти в каталог
                </a>
            </div>
        `;
        return;
    }
    
    favoritesList.innerHTML = '<div class="favorites-grid">';
    for (let i = 0; i < favoriteProducts.length; i++) {
        const product = favoriteProducts[i];
        favoritesList.innerHTML += `
            <div class="favorite-product">
                <div class="favorite-product-image" onclick="window.location.href='product.html?id=${product.id}'">
                    <img src="${product.images[0]}" alt="${product.name}">
                </div>
                <div class="favorite-product-info">
                    <h4>${product.name}</h4>
                    <p class="price">${product.price.toLocaleString()} руб.</p>
                    <button class="modern-btn outline" onclick="removeFromFavorites(${product.id})">
                        <i class="fas fa-trash-alt"></i> Удалить
                    </button>
                </div>
            </div>
        `;
    }
    favoritesList.innerHTML += '</div>';
}

function removeFromFavorites(productId) {
    favorites = favorites.filter(id => id !== productId);
    saveFavorites();
    updateFavoriteCount();
    displayFavorites();
    showNotification('Товар удален из избранного', 'info');
}

// Загрузка заказов
async function loadUserOrders() {
    try {
        const response = await fetch('php/get_orders.php');
        const data = await response.json();
        if (data.orders) {
            userOrders = data.orders.filter(order => order.user_id == currentUser.id || order.user_name === currentUser.name);
            displayOrders();
        }
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

function displayOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    if (userOrders.length === 0) {
        ordersList.innerHTML = `<div class="empty-orders"><i class="fas fa-shopping-bag"></i><p>У вас пока нет заказов</p><a href="Main.html#catalog" class="modern-btn outline">Перейти в каталог</a></div>`;
        return;
    }
    ordersList.innerHTML = '';
    userOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';
        orderElement.innerHTML = `
            <div class="order-header">
                <span class="order-id">Заказ #${order.id}</span>
                <span class="order-date">${new Date(order.created_at).toLocaleString()}</span>
                <span class="order-status status-${order.status}">${getStatusText(order.status)}</span>
            </div>
            <div class="order-items">
                ${order.items.slice(0, 2).map(item => `<div class="order-item-row"><span>${item.name} ${item.size ? `(Размер: ${item.size})` : ''}</span><span>${item.quantity} шт. × ${item.price} руб.</span></div>`).join('')}
                ${order.items.length > 2 ? `<div class="order-item-row" style="color: #667eea;">и еще ${order.items.length - 2} товаров...</div>` : ''}
            </div>
            <div class="order-total">Итого: ${(order.total || 0).toLocaleString()} руб.</div>
            <button class="view-details-btn" onclick="viewOrderDetails(${order.id}, 'order')"><i class="fas fa-eye"></i> Подробнее</button>
        `;
        ordersList.appendChild(orderElement);
    });
}

// Загрузка заявок на дизайн
async function loadUserCustomOrders() {
    try {
        const response = await fetch('php/get_custom_orders.php');
        const data = await response.json();
        if (data.orders) {
            userCustomOrders = data.orders.filter(order => order.user_id == currentUser.id || order.user_name === currentUser.name);
            displayCustomOrders();
        }
    } catch (error) {
        console.error('Error loading custom orders:', error);
    }
}

function displayCustomOrders() {
    const customOrdersList = document.getElementById('customOrdersList');
    if (!customOrdersList) return;
    if (userCustomOrders.length === 0) {
        customOrdersList.innerHTML = `<div class="empty-orders"><i class="fas fa-palette"></i><p>У вас пока нет заявок на дизайн</p><button class="modern-btn outline" onclick="window.location.href='Main.html'">Заказать дизайн</button></div>`;
        return;
    }
    customOrdersList.innerHTML = '';
    userCustomOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';
        orderElement.innerHTML = `
            <div class="order-header">
                <span class="order-id">Заявка #${order.id}</span>
                <span class="order-date">${new Date(order.created_at).toLocaleString()}</span>
                <span class="order-status status-${order.status}">${getStatusText(order.status, 'design')}</span>
            </div>
            <div class="order-items">
                ${order.garment_type ? `<p><strong>Тип одежды:</strong> ${order.garment_type}</p>` : ''}
                ${order.size_info ? `<p><strong>Размер:</strong> ${order.size_info}</p>` : ''}
                <div class="order-item-row" style="flex-direction: column; align-items: flex-start;">
                    <span><strong>Описание:</strong></span>
                    <span style="color: #666; font-size: 14px;">${order.description ? order.description.substring(0, 100) + (order.description.length > 100 ? '...' : '') : ''}</span>
                </div>
            </div>
            <button class="view-details-btn" onclick="viewOrderDetails(${order.id}, 'design')"><i class="fas fa-eye"></i> Подробнее</button>
        `;
        customOrdersList.appendChild(orderElement);
    });
}

// Просмотр деталей
function viewOrderDetails(orderId, type = 'order') {
    let order;
    if (type === 'design') {
        order = userCustomOrders.find(o => o.id == orderId);
    } else {
        order = userOrders.find(o => o.id == orderId);
    }
    if (!order) { showNotification('Заказ не найден', 'error'); return; }
    
    const modalContent = document.getElementById('orderDetailContent');
    const modalTitle = document.getElementById('modalOrderTitle');
    if (!modalContent || !modalTitle) return;
    modalTitle.textContent = type === 'design' ? `Детали заявки #${order.id}` : `Детали заказа #${order.id}`;
    
    let html = '';
    if (type === 'design') {
        html = `
            <div class="detail-row"><div class="detail-label">ID заявки:</div><div class="detail-value">#${order.id}</div></div>
            <div class="detail-row"><div class="detail-label">Дата:</div><div class="detail-value">${new Date(order.created_at).toLocaleString()}</div></div>
            <div class="detail-row"><div class="detail-label">Статус:</div><div class="detail-value"><span class="status-badge status-${order.status}">${getStatusText(order.status, 'design')}</span></div></div>
            <div class="detail-row"><div class="detail-label">Тип одежды:</div><div class="detail-value">${order.garment_type || 'Не указан'}</div></div>
            <div class="detail-row"><div class="detail-label">Размер:</div><div class="detail-value">${order.size_info || 'Не указан'}</div></div>
            <div class="detail-row"><div class="detail-label">Описание:</div><div class="detail-value"><div class="order-full-description">${order.description || 'Нет описания'}</div></div></div>
        `;
    } else {
        html = `
            <div class="detail-row"><div class="detail-label">ID заказа:</div><div class="detail-value">#${order.id}</div></div>
            <div class="detail-row"><div class="detail-label">Дата:</div><div class="detail-value">${new Date(order.created_at).toLocaleString()}</div></div>
            <div class="detail-row"><div class="detail-label">Статус:</div><div class="detail-value"><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></div></div>
            <div class="detail-row"><div class="detail-label">Получатель:</div><div class="detail-value">${order.full_name || order.user_name}</div></div>
            <div class="detail-row"><div class="detail-label">Телефон:</div><div class="detail-value">${order.phone || '-'}</div></div>
            <div class="detail-row"><div class="detail-label">Адрес:</div><div class="detail-value">${order.city || '-'}, ${order.address || '-'}</div></div>
            <div class="detail-row"><div class="detail-label">Товары:</div><div class="detail-value">${order.items.map(item => `<div style="margin:5px 0;">${item.name} (${item.size}) - ${item.quantity}шт x ${item.price}руб</div>`).join('')}</div></div>
            <div class="detail-row"><div class="detail-label">Итого:</div><div class="detail-value"><strong>${(order.total || 0).toLocaleString()} руб.</strong></div></div>
        `;
    }
    modalContent.innerHTML = html;
    openPopup('orderDetailModal');
}

// Проверка авторизации
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user) { window.location.href = 'Main.html'; return; }
    currentUser = JSON.parse(user);
    displayUserInfo();
    loadUserOrders();
    loadUserCustomOrders();
    updateCartCount();
    loadFavorites();
    startAutoUpdate();
}

function startAutoUpdate() {
    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(() => { if (currentUser) { loadUserOrders(); loadUserCustomOrders(); } }, 5000);
}

window.addEventListener('beforeunload', () => { if (updateInterval) clearInterval(updateInterval); });

function displayUserInfo() {
    const nameEl = document.getElementById('profileName');
    const emailEl = document.getElementById('profileEmail');
    const editNameEl = document.getElementById('editName');
    const editEmailEl = document.getElementById('editEmail');
    const userIdEl = document.getElementById('userId');
    if (nameEl) nameEl.textContent = currentUser.name;
    if (emailEl) emailEl.textContent = currentUser.email || 'не указан';
    if (editNameEl) editNameEl.value = currentUser.name;
    if (editEmailEl) editEmailEl.value = currentUser.email || '';
    if (userIdEl) userIdEl.textContent = currentUser.id || '—';
}

function updateCartCount() {
    const cartKey = `cart_${currentUser ? currentUser.id : 'guest'}`;
    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById('cartCount');
    if (cartCount) cartCount.textContent = count;
}

function updateName() {
    const newName = document.getElementById('editName').value.trim();
    if (!newName) { showNotification('Имя не может быть пустым', 'error'); return; }
    if (newName === currentUser.name) { showNotification('Имя не изменено', 'info'); return; }
    currentUser.name = newName;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    displayUserInfo();
    showNotification('Имя успешно изменено!', 'success');
}

function updatePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (!currentPassword || !newPassword || !confirmPassword) { showNotification('Заполните все поля', 'error'); return; }
    if (newPassword !== confirmPassword) { showNotification('Пароли не совпадают', 'error'); return; }
    if (newPassword.length < 4) { showNotification('Пароль минимум 4 символа', 'error'); return; }
    showNotification('Пароль успешно изменен!', 'success');
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

function logout() {
    if (updateInterval) clearInterval(updateInterval);
    localStorage.removeItem('currentUser');
    showNotification('Вы вышли из системы', 'info');
    setTimeout(() => window.location.href = 'Main.html', 1000);
}

function openPopup(id) { const popup = document.getElementById(id); if (popup) popup.style.display = 'flex'; }
function closePopup(id) { const popup = document.getElementById(id); if (popup) popup.style.display = 'none'; }

function setupTabs() {
    const menuBtns = document.querySelectorAll('.menu-btn');
    const tabs = document.querySelectorAll('.tab-content');
    menuBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            menuBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            tabs.forEach(tab => tab.classList.remove('active'));
            const targetTab = document.getElementById(`tab-${tabId}`);
            if (targetTab) targetTab.classList.add('active');
            if (tabId === 'favorites') displayFavorites();
            if (tabId === 'orders') loadUserOrders();
            if (tabId === 'custom') loadUserCustomOrders();
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    checkAuth();
    setupTabs();
});