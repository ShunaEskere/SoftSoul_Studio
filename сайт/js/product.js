let currentProduct = null;
let selectedSize = null;
let currentUser = null;
let currentRating = 0;
let productReviews = [];
let basePrice = 0;
let sizePrices = {};

function getProductId() { return new URLSearchParams(window.location.search).get('id'); }

async function loadProduct() {
    const productId = getProductId();
    if (!productId) { window.location.href = 'Main.html'; return; }
    try {
        const response = await fetch(`php/get_product.php?id=${productId}`);
        const data = await response.json();
        if (data.success && data.product) {
            currentProduct = data.product;
            basePrice = currentProduct.price;
            sizePrices = currentProduct.size_prices || {};
            displayProduct();
            loadReviews();
        } else { window.location.href = '404.html'; }
    } catch(e) { window.location.href = '404.html'; }
}

function displayProduct() {
    document.getElementById('productTitle').textContent = currentProduct.name;
    updatePriceDisplay();
    document.getElementById('productDescription').textContent = currentProduct.description || 'Описание отсутствует';
    document.getElementById('mainImage').src = currentProduct.image || 'images/placeholder.jpg';
    let sizes = [];
    if (currentProduct.sizes) sizes = currentProduct.sizes.split(',').map(s => s.trim());
    else sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const container = document.getElementById('sizeButtons');
    container.innerHTML = '';
    sizes.forEach(size => {
        const btn = document.createElement('button');
        btn.textContent = size;
        btn.className = 'size-btn';
        btn.onclick = () => selectSize(size, btn);
        container.appendChild(btn);
    });
}

function formatPrice(price) { return Number(price).toLocaleString('ru-RU') + ' руб.'; }
function getCurrentPrice() { return (selectedSize && sizePrices[selectedSize]) ? sizePrices[selectedSize] : basePrice; }

function updatePriceDisplay() {
    const currentPrice = getCurrentPrice();
    document.getElementById('productPrice').textContent = formatPrice(currentPrice);
    const info = document.getElementById('sizePriceInfo');
    if (selectedSize && sizePrices[selectedSize] && sizePrices[selectedSize] !== basePrice) {
        const diff = sizePrices[selectedSize] - basePrice;
        info.textContent = `Цена для размера ${selectedSize}: ${diff > 0 ? '+' : ''}${diff} руб. от базовой`;
        info.style.color = diff > 0 ? '#ff9800' : '#4caf50';
    } else { info.textContent = ''; }
}

function selectSize(size, btn) {
    selectedSize = size;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updatePriceDisplay();
}

function changeQuantity(delta) {
    const input = document.getElementById('quantity');
    let val = parseInt(input.value) + delta;
    if (val < 1) val = 1;
    if (val > 99) val = 99;
    input.value = val;
}

function addToCart() {
    if (!currentUser) { alert('Войдите в аккаунт'); window.location.href = 'Main.html'; return; }
    if (!selectedSize) { alert('Выберите размер'); return; }
    const quantity = parseInt(document.getElementById('quantity').value);
    const currentPrice = getCurrentPrice();
    let cart = JSON.parse(localStorage.getItem(`cart_${currentUser.id}`) || '[]');
    const idx = cart.findIndex(i => i.id === currentProduct.id && i.size === selectedSize);
    if (idx !== -1) cart[idx].quantity += quantity;
    else cart.push({ id: currentProduct.id, name: currentProduct.name, price: currentPrice, size: selectedSize, quantity: quantity, image: currentProduct.image });
    localStorage.setItem(`cart_${currentUser.id}`, JSON.stringify(cart));
    updateCartCount();
    showNotification('Товар добавлен в корзину!', 'success');
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem(`cart_${currentUser?.id}`) || '[]');
    const count = cart.reduce((s, i) => s + i.quantity, 0);
    const cc = document.getElementById('cartCount');
    if (cc) cc.textContent = count;
}

function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        const isAdmin = currentUser.name === 'admin';
        document.getElementById('authButtons').style.display = 'none';
        document.getElementById('userPanel').style.display = 'flex';
        if (isAdmin) document.getElementById('adminBtn').style.display = 'inline-flex';
        updateCartCount();
        loadFavoritesCount();
    }
}

function loadFavoritesCount() {
    if (currentUser) {
        const fav = JSON.parse(localStorage.getItem(`favorites_${currentUser.id}`) || '[]');
        const fc = document.getElementById('favoriteCount');
        if (fc) fc.textContent = fav.length;
    }
}

function loadReviews() {
    const all = JSON.parse(localStorage.getItem('productReviews') || '{}');
    productReviews = all[currentProduct?.id] || [];
    displayReviews();
}

function displayReviews() {
    const container = document.getElementById('reviewsList');
    if (!container) return;
    if (productReviews.length === 0) { container.innerHTML = '<p style="text-align:center;color:#999;">Пока нет отзывов. Будьте первым!</p>'; return; }
    container.innerHTML = '';
    productReviews.forEach(r => {
        const date = new Date(r.date);
        container.innerHTML += `<div class="review-item"><div class="review-avatar">${r.authorName.charAt(0).toUpperCase()}</div><div class="review-content"><div class="review-author">${escapeHtml(r.authorName)}</div><div class="review-rating">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div><div class="review-text">${escapeHtml(r.text)}</div><div class="review-date">${date.toLocaleDateString('ru-RU')}</div></div></div>`;
    });
}

function showReviewForm() {
    if (!currentUser) { alert('Войдите в аккаунт'); window.location.href = 'Main.html'; return; }
    document.getElementById('reviewForm').style.display = 'block';
    const ratingDiv = document.getElementById('ratingSelect');
    ratingDiv.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('i');
        star.className = 'far fa-star';
        star.style.fontSize = '24px';
        star.style.cursor = 'pointer';
        star.style.marginRight = '5px';
        star.onclick = () => setRating(i);
        ratingDiv.appendChild(star);
    }
}

function setRating(rating) {
    currentRating = rating;
    const stars = document.querySelectorAll('#ratingSelect i');
    stars.forEach((star, idx) => { star.className = idx < rating ? 'fas fa-star' : 'far fa-star'; });
}

function submitReview() {
    const text = document.getElementById('reviewText').value.trim();
    if (currentRating === 0) { alert('Поставьте оценку'); return; }
    if (!text) { alert('Напишите отзыв'); return; }
    const newReview = { authorName: currentUser.name, authorEmail: currentUser.email, rating: currentRating, text: text, date: new Date().toISOString() };
    productReviews.unshift(newReview);
    const all = JSON.parse(localStorage.getItem('productReviews') || '{}');
    all[currentProduct.id] = productReviews;
    localStorage.setItem('productReviews', JSON.stringify(all));
    displayReviews();
    document.getElementById('reviewText').value = '';
    currentRating = 0;
    document.getElementById('reviewForm').style.display = 'none';
    showNotification('Спасибо за отзыв!', 'success');
}

function showNotification(message, type) {
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.innerHTML = `<div class="toast-content ${type}"><i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i><div class="toast-message">${message}</div></div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
function createParticles() {
    const container = document.getElementById('bgAnimation');
    for (let i = 0; i < 60; i++) {
        const p = document.createElement('span');
        p.style.width = Math.random() * 40 + 10 + 'px';
        p.style.height = p.style.width;
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = Math.random() * 12 + 6 + 's';
        p.style.animationDelay = Math.random() * 5 + 's';
        p.style.opacity = Math.random() * 0.3 + 0.1;
        p.style.background = `radial-gradient(circle, rgba(102,126,234,0.4) 0%, rgba(118,75,162,0.2) 100%)`;
        container.appendChild(p);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    checkAuth();
    loadProduct();
});
// Добавьте в конец файла product.js

let galleryImages = [];
let currentGalleryIndex = 0;

// Обновленная функция displayProduct с галереей
function displayProduct() {
    document.getElementById('productTitle').textContent = currentProduct.name;
    updatePriceDisplay();
    document.getElementById('productDescription').textContent = currentProduct.description || 'Описание отсутствует';
    
    // Создаем галерею изображений
    galleryImages = [currentProduct.image];
    if (currentProduct.image2) galleryImages.push(currentProduct.image2);
    if (currentProduct.image3) galleryImages.push(currentProduct.image3);
    if (currentProduct.image_back) galleryImages.push(currentProduct.image_back);
    if (currentProduct.image_model) galleryImages.push(currentProduct.image_model);
    
    // Отображаем главное изображение
    const mainImage = document.getElementById('mainImage');
    mainImage.src = galleryImages[0];
    mainImage.onclick = () => openGallery(0);
    
    // Отображаем миниатюры
    const thumbnailList = document.getElementById('thumbnailList');
    thumbnailList.innerHTML = '';
    galleryImages.forEach((img, idx) => {
        const thumb = document.createElement('img');
        thumb.src = img;
        thumb.className = 'thumbnail';
        if (idx === 0) thumb.classList.add('active');
        thumb.onclick = () => changeImage(idx);
        thumbnailList.appendChild(thumb);
    });
    
    // Размеры
    let sizes = [];
    if (currentProduct.sizes) sizes = currentProduct.sizes.split(',').map(s => s.trim());
    else sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const container = document.getElementById('sizeButtons');
    container.innerHTML = '';
    sizes.forEach(size => {
        const btn = document.createElement('button');
        btn.textContent = size;
        btn.className = 'size-btn';
        btn.onclick = () => selectSize(size, btn);
        container.appendChild(btn);
    });
}

function changeImage(index) {
    currentGalleryIndex = index;
    const mainImage = document.getElementById('mainImage');
    mainImage.src = galleryImages[index];
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

function openGallery(index) {
    currentGalleryIndex = index;
    const modal = document.getElementById('galleryModal');
    const modalImg = document.getElementById('galleryImage');
    modalImg.src = galleryImages[currentGalleryIndex];
    modal.classList.add('show');
}

function closeGallery() {
    document.getElementById('galleryModal').classList.remove('show');
}

function prevImage() {
    currentGalleryIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
    document.getElementById('galleryImage').src = galleryImages[currentGalleryIndex];
}

function nextImage() {
    currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
    document.getElementById('galleryImage').src = galleryImages[currentGalleryIndex];
}

// Добавьте обработчики клавиш для галереи
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('galleryModal');
    if (modal && modal.classList.contains('show')) {
        if (e.key === 'Escape') closeGallery();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'ArrowRight') nextImage();
    }
});