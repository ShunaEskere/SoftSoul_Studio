async function loadUserOrders() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`php/get_orders.php?user_id=${currentUser.id}`);
        const data = await response.json();
        
        if (data.success && data.orders) {
            userOrders = data.orders;
            displayOrders();
        } else {
            userOrders = [];
            displayOrders();
        }
    } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
        userOrders = [];
        displayOrders();
    }
}

function displayOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    if (!userOrders || userOrders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-orders">
                <i class="fas fa-shopping-bag"></i>
                <p>У вас пока нет заказов</p>
                <a href="Main.html#catalog" class="modern-btn outline">Перейти в каталог</a>
            </div>
        `;
        return;
    }
    
    ordersList.innerHTML = '';
    userOrders.forEach(order => {
        const orderDate = new Date(order.created_at).toLocaleString('ru-RU');
        const statusText = getOrderStatusText(order.status);
        const items = order.items || [];
        
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';
        orderElement.innerHTML = `
            <div class="order-header">
                <span class="order-id">Заказ #${order.id}</span>
                <span class="order-date">${orderDate}</span>
                <span class="order-status status-${order.status}">${statusText}</span>
            </div>
            <div class="order-items">
                ${items.slice(0, 2).map(item => `
                    <div class="order-item-row">
                        <span>${item.name} ${item.size ? `(Размер: ${item.size})` : ''}</span>
                        <span>${item.quantity} шт. × ${item.price} руб.</span>
                    </div>
                `).join('')}
                ${items.length > 2 ? `<div class="order-item-row" style="color: #667eea;">и еще ${items.length - 2} товаров...</div>` : ''}
            </div>
            <div class="order-total">Итого: ${Number(order.total).toLocaleString()} руб.</div>
            <button class="view-details-btn" onclick="viewOrderDetails(${order.id}, 'order')">
                <i class="fas fa-eye"></i> Подробнее
            </button>
        `;
        ordersList.appendChild(orderElement);
    });
}

function getOrderStatusText(status) {
    const statuses = {
        'pending': 'В обработке',
        'confirmed': 'Подтверждён',
        'shipped': 'Отправлен',
        'delivered': 'Доставлен',
        'cancelled': 'Отменён'
    };
    return statuses[status] || status;
}
