// Глобальные переменные
let currentUser = null;
let cart = [];
let deliveryPrices = { courier: 300, pickup: 0, post: 200 };
let selectedPaymentMethod = null;
let savedCards = [];

// Создание частиц
function createParticles() {
    const container = document.getElementById('bgAnimation');
    if (!container) return;
    for (let i = 0; i < 60; i++) {
        const particle = document.createElement('span');
        const size = Math.random() * 40 + 10;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = Math.random() * 12 + 6 + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.opacity = Math.random() * 0.3 + 0.1;
        particle.style.background = `radial-gradient(circle, rgba(102,126,234,0.4) 0%, rgba(118,75,162,0.2) 100%)`;
        container.appendChild(particle);
    }
}

function showToast(message, type) {
    const existing = document.querySelector('.custom-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    let icon = type === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-circle"></i>';
    toast.innerHTML = `<div class="toast-content ${type}">${icon}<div class="toast-message">${message}</div></div>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Ключ для корзины текущего пользователя
function getCartKey() {
    if (!currentUser) return 'cart_guest';
    return `cart_${currentUser.id}`;
}

// Загрузка корзины
function loadCart() {
    const cartKey = getCartKey();
    const savedCart = localStorage.getItem(cartKey);
    cart = savedCart ? JSON.parse(savedCart) : [];
    displayCart();
}

// Сохранение корзины
function saveCart() {
    const cartKey = getCartKey();
    localStorage.setItem(cartKey, JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const count = cart.reduce((s, i) => s + i.quantity, 0);
    const cartCount = document.getElementById('cartCount');
    if (cartCount) cartCount.textContent = count;
}

function displayCart() {
    const cartItemsDiv = document.getElementById('cartItems');
    const cartContent = document.getElementById('cartContent');
    const emptyCart = document.getElementById('emptyCart');
    
    if (cart.length === 0) {
        if (cartContent) cartContent.style.display = 'none';
        if (emptyCart) emptyCart.style.display = 'block';
        return;
    }
    
    if (cartContent) cartContent.style.display = 'grid';
    if (emptyCart) emptyCart.style.display = 'none';
    if (!cartItemsDiv) return;
    
    cartItemsDiv.innerHTML = '';
    let subtotal = 0;
    cart.forEach((item, idx) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        cartItemsDiv.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-image"><img src="${item.image || 'images/placeholder.jpg'}"></div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${escapeHtml(item.name)}</div>
                    <div class="cart-item-size">Размер: ${item.size || 'не выбран'}</div>
                    <div class="cart-item-price">${item.price.toLocaleString()} руб.</div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="updateQuantity(${idx}, -1)">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99" onchange="updateQuantity(${idx}, 0, this.value)">
                        <button class="quantity-btn" onclick="updateQuantity(${idx}, 1)">+</button>
                    </div>
                    <button class="remove-item" onclick="removeFromCart(${idx})"><i class="fas fa-trash-alt"></i></button>
                </div>
                <div class="cart-item-total">${itemTotal.toLocaleString()} руб.</div>
            </div>
        `;
    });
    updateSummary(subtotal);
}

function updateQuantity(index, delta, newVal) {
    if (delta !== 0) {
        let q = cart[index].quantity + delta;
        if (q < 1) q = 1;
        if (q > 99) q = 99;
        cart[index].quantity = q;
    } else if (newVal) {
        let q = parseInt(newVal);
        if (isNaN(q)) q = 1;
        if (q < 1) q = 1;
        if (q > 99) q = 99;
        cart[index].quantity = q;
    }
    saveCart();
    displayCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    displayCart();
    updateCartCount();
    showToast('Товар удален', 'info');
}

function updateSummary(subtotal) {
    const delivery = deliveryPrices[document.getElementById('deliveryMethod').value];
    const total = subtotal + delivery;
    document.getElementById('itemsCount').textContent = cart.reduce((s, i) => s + i.quantity, 0);
    document.getElementById('subtotal').textContent = subtotal.toLocaleString() + ' руб.';
    document.getElementById('deliveryCost').textContent = delivery.toLocaleString() + ' руб.';
    document.getElementById('totalAmount').textContent = total.toLocaleString() + ' руб.';
}

function updateOrderSummary() {
    const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const delivery = deliveryPrices[document.getElementById('deliveryMethod').value];
    const total = subtotal + delivery;
    document.getElementById('orderItemsCount').textContent = cart.reduce((s, i) => s + i.quantity, 0);
    document.getElementById('orderSubtotal').textContent = subtotal.toLocaleString();
    document.getElementById('orderDelivery').textContent = delivery.toLocaleString();
    document.getElementById('orderTotal').textContent = total.toLocaleString();
}

// Проверка авторизации
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        const isAdmin = currentUser.name === 'admin';
        if (isAdmin) document.getElementById('adminBtn').style.display = 'inline-flex';
        loadCart();
        loadSavedCards();
    } else {
        window.location.href = 'Main.html';
    }
}

// Функции для карт
function detectCardBrand(cardNumber) {
    const num = cardNumber.replace(/\s/g, '');
    if (num.startsWith('4')) return { brand: 'Visa', icon: '<i class="fab fa-cc-visa visa" style="font-size: 28px;"></i>' };
    if (num.startsWith('5') || (num.startsWith('2') && num.substring(0,2) >= '22' && num.substring(0,2) <= '27')) 
        return { brand: 'Mastercard', icon: '<i class="fab fa-cc-mastercard mastercard" style="font-size: 28px;"></i>' };
    if (num.startsWith('2')) return { brand: 'Мир', icon: '<i class="fas fa-credit-card mir" style="font-size: 28px;"></i>' };
    if (num.startsWith('34') || num.startsWith('37')) 
        return { brand: 'American Express', icon: '<i class="fab fa-cc-amex amex" style="font-size: 28px;"></i>' };
    return { brand: 'Card', icon: '<i class="fas fa-credit-card" style="font-size: 28px; color:#666;"></i>' };
}

function formatCardNumber(input) {
    let value = input.value.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += ' ';
        formatted += value[i];
    }
    input.value = formatted.substring(0, 19);
    const cardInfo = detectCardBrand(formatted);
    document.getElementById('cardBrandIcon').innerHTML = cardInfo.icon;
}

function formatExpiryDate(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        input.value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
}

function selectPaymentMethod(method, element) {
    selectedPaymentMethod = method;
    document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
    if (element) element.classList.add('selected');
    const cardPayment = document.getElementById('cardPayment');
    if (method === 'card') {
        cardPayment.style.display = 'block';
        loadSavedCards();
    } else {
        cardPayment.style.display = 'none';
    }
}

function toggleNewCardForm() {
    const isChecked = document.getElementById('useNewCard').checked;
    document.getElementById('newCardForm').style.display = isChecked ? 'block' : 'none';
}

async function loadSavedCards() {
    if (!currentUser) return;
    try {
        const response = await fetch(`php/get_cards.php?user_id=${currentUser.id}`);
        const data = await response.json();
        if (data.success && data.cards) {
            savedCards = data.cards;
            displaySavedCards();
        }
    } catch (error) {
        console.error('Error loading cards:', error);
    }
}

function displaySavedCards() {
    const container = document.getElementById('savedCardsList');
    if (!container) return;
    if (savedCards.length === 0) {
        container.innerHTML = '<p style="color:#999;">Нет сохраненных карт</p>';
        return;
    }
    container.innerHTML = savedCards.map(card => `
        <div class="saved-card" onclick="selectSavedCard(${card.id})" data-card-id="${card.id}">
            <div>${detectCardBrand(card.card_number).icon}</div>
            <div class="card-number">**** ${card.card_number.slice(-4)}</div>
            <div class="card-expiry">До: ${card.expiry_date}</div>
            <div class="card-holder">${card.card_holder}</div>
        </div>
    `).join('');
}

function selectSavedCard(cardId) {
    document.querySelectorAll('.saved-card').forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.cardId == cardId) card.classList.add('selected');
    });
    document.getElementById('useNewCard').checked = false;
    document.getElementById('newCardForm').style.display = 'none';
    window.selectedCardId = cardId;
}

async function saveCard(cardData) {
    if (!currentUser) return null;
    try {
        const response = await fetch('php/save_card.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: currentUser.id,
                card_number: cardData.card_number,
                card_holder: cardData.card_holder,
                expiry_date: cardData.expiry_date
            })
        });
        const data = await response.json();
        if (data.success) return data.card_id;
    } catch (error) { console.error('Error saving card:', error); }
    return null;
}

function goToStep(step) {
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step3').style.display = 'none';
    document.getElementById(`step${step}`).style.display = 'block';
    if (step === 3) {
        const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
        const delivery = deliveryPrices[document.getElementById('deliveryMethod').value];
        const total = subtotal + delivery;
        const fullName = document.getElementById('fullName').value;
        const phone = document.getElementById('phone').value;
        const city = document.getElementById('city').value;
        const address = document.getElementById('address').value;
        let paymentInfo = selectedPaymentMethod === 'cash' ? 'Наличные при получении' : 'Банковская карта';
        document.getElementById('orderSummary').innerHTML = `
            <p><strong>Получатель:</strong> ${fullName}</p>
            <p><strong>Телефон:</strong> ${phone}</p>
            <p><strong>Адрес:</strong> ${city}, ${address}</p>
            <p><strong>Оплата:</strong> ${paymentInfo}</p>
            <div style="margin:10px 0;"><strong>Товары:</strong></div>
            ${cart.map(item => `<div>${item.name} (${item.size}) - ${item.quantity} шт. × ${item.price} руб.</div>`).join('')}
            <p style="margin-top:10px;"><strong>Итого: ${total.toLocaleString()} руб.</strong></p>
        `;
    }
}

function showCheckoutForm() {
    if (!currentUser) { showToast('Войдите в аккаунт', 'error'); return; }
    if (cart.length === 0) { showToast('Корзина пуста', 'error'); return; }
    selectedPaymentMethod = null;
    window.selectedCardId = null;
    document.getElementById('fullName').value = currentUser.name || '';
    document.getElementById('cardPayment').style.display = 'none';
    document.getElementById('useNewCard').checked = false;
    document.getElementById('newCardForm').style.display = 'none';
    document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
    updateOrderSummary();
    goToStep(1);
    document.getElementById('checkoutModal').style.display = 'flex';
}

function closeCheckoutForm() {
    document.getElementById('checkoutModal').style.display = 'none';
}

async function submitOrder() {
    const fullName = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const deliveryMethod = document.getElementById('deliveryMethod').value;
    const city = document.getElementById('city').value.trim();
    const address = document.getElementById('address').value.trim();
    
    if (!fullName || !phone || !email || !city || !address) {
        showToast('Заполните все поля', 'error');
        goToStep(1);
        return;
    }
    if (!selectedPaymentMethod) {
        showToast('Выберите способ оплаты', 'error');
        goToStep(2);
        return;
    }
    
    const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const delivery = deliveryPrices[deliveryMethod];
    const total = subtotal + delivery;
    
    let savedCardId = null;
    if (selectedPaymentMethod === 'card' && document.getElementById('useNewCard').checked) {
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const expiryDate = document.getElementById('expiryDate').value;
        const cardHolder = document.getElementById('cardHolder').value;
        const saveCardFlag = document.getElementById('saveCardCheckbox').checked;
        if (!cardNumber || !expiryDate || !cardHolder) {
            showToast('Заполните данные карты', 'error');
            return;
        }
        if (saveCardFlag) {
            savedCardId = await saveCard({ card_number: cardNumber, card_holder: cardHolder, expiry_date: expiryDate });
        }
    }
    
    const orderData = {
        userId: currentUser.id, userName: currentUser.name, userEmail: currentUser.email,
        fullName, phone, email, deliveryMethod, deliveryPrice: delivery,
        city, address, paymentMethod: selectedPaymentMethod, items: cart, subtotal, total, savedCardId
    };
    
    showToast('Оформление заказа...', 'info');
    try {
        const response = await fetch('php/create_order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        const data = await response.json();
        if (data.success) {
            cart = [];
            saveCart();
            closeCheckoutForm();
            showToast('Заказ оформлен!', 'success');
            setTimeout(() => { window.location.href = 'profile.html?tab=orders'; }, 1500);
        } else {
            showToast(data.message || 'Ошибка', 'error');
        }
    } catch (error) {
        showToast('Ошибка сервера', 'error');
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    checkAuth();
});