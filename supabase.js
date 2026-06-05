// ========== НАСТРОЙКИ SUPABASE ==========
const SUPABASE_URL = 'https://gyrysnmymvwdmpeifhdk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UMVS8JunhUJFyIloGMqlxQ_UUWD8eXG';

// ========== БАЗОВЫЙ ЗАПРОС ==========
async function supabaseFetch(table, options = {}) {
    let url = `${SUPABASE_URL}/rest/v1/${table}`;
    
    // Добавляем фильтры если есть
    if (options.filter && options.value) {
        url += `?${options.filter}=eq.${options.value}`;
    }
    
    // Добавляем сортировку
    if (options.orderBy) {
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}order=${options.orderBy}.desc`;
    }
    
    const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
        },
        body: options.body ? JSON.stringify(options.body) : undefined
    });
    
    if (!response.ok) {
        const error = await response.text();
        console.error('Supabase error:', error);
        throw new Error(`HTTP ${response.status}: ${error}`);
    }
    
    return await response.json();
}

// ========== РЕГИСТРАЦИЯ ==========
async function supabaseRegister(name, email, password) {
    try {
        // Проверяем, существует ли пользователь
        const existing = await supabaseFetch('client', { filter: 'email', value: email });
        
        if (existing && existing.length > 0) {
            return { success: false, message: 'Email уже используется' };
        }
        
        // Создаём нового пользователя
        const result = await supabaseFetch('client', {
            method: 'POST',
            body: { name, email, passw: password }
        });
        
        if (result && result[0]) {
            return { success: true, user: result[0] };
        }
        return { success: false, message: 'Ошибка регистрации' };
    } catch (error) {
        console.error('Register error:', error);
        return { success: false, message: 'Ошибка сервера: ' + error.message };
    }
}

// ========== ВХОД ==========
async function supabaseLogin(login, password) {
    try {
        // Получаем всех пользователей
        const users = await supabaseFetch('client');
        
        if (!users || users.length === 0) {
            return { success: false, message: 'Пользователь не найден' };
        }
        
        const user = users.find(u => (u.name === login || u.email === login) && u.passw === password);
        
        if (user) {
            return { success: true, user: user };
        }
        return { success: false, message: 'Неверный логин или пароль' };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Ошибка сервера: ' + error.message };
    }
}

// ========== ПОЛУЧИТЬ ТОВАРЫ ==========
async function supabaseGetProducts() {
    try {
        return await supabaseFetch('products', { orderBy: 'id' });
    } catch (error) {
        console.error('Get products error:', error);
        return [];
    }
}

// ========== ПОЛУЧИТЬ ОДИН ТОВАР ==========
async function supabaseGetProduct(id) {
    try {
        const products = await supabaseFetch('products', { filter: 'id', value: id });
        return products && products[0] ? products[0] : null;
    } catch (error) {
        console.error('Get product error:', error);
        return null;
    }
}

// ========== СОХРАНИТЬ ЗАКАЗ ==========
async function supabaseSaveOrder(orderData) {
    try {
        const result = await supabaseFetch('orders', {
            method: 'POST',
            body: orderData
        });
        return { success: true, order: result };
    } catch (error) {
        console.error('Save order error:', error);
        return { success: false, message: error.message };
    }
}

// ========== ПОЛУЧИТЬ ЗАКАЗЫ ПОЛЬЗОВАТЕЛЯ ==========
async function supabaseGetUserOrders(userId) {
    try {
        return await supabaseFetch('orders', { filter: 'user_id', value: userId });
    } catch (error) {
        console.error('Get orders error:', error);
        return [];
    }
}

// ========== СОХРАНИТЬ ЗАЯВКУ НА ДИЗАЙН ==========
async function supabaseSaveCustomOrder(orderData) {
    try {
        const result = await supabaseFetch('custom_orders', {
            method: 'POST',
            body: orderData
        });
        return { success: true, order: result };
    } catch (error) {
        console.error('Save custom order error:', error);
        return { success: false, message: error.message };
    }
}

// ========== ПОЛУЧИТЬ ЗАЯВКИ ПОЛЬЗОВАТЕЛЯ ==========
async function supabaseGetUserCustomOrders(userId) {
    try {
        return await supabaseFetch('custom_orders', { filter: 'user_id', value: userId });
    } catch (error) {
        console.error('Get custom orders error:', error);
        return [];
    }
}

// ========== ИЗБРАННОЕ ==========
async function supabaseGetFavorites(userId) {
    try {
        return await supabaseFetch('favorites', { filter: 'user_id', value: userId });
    } catch (error) {
        console.error('Get favorites error:', error);
        return [];
    }
}

async function supabaseAddFavorite(userId, productId) {
    try {
        return await supabaseFetch('favorites', {
            method: 'POST',
            body: { user_id: userId, product_id: productId }
        });
    } catch (error) {
        console.error('Add favorite error:', error);
        return null;
    }
}

async function supabaseRemoveFavorite(userId, productId) {
    try {
        const url = `${SUPABASE_URL}/rest/v1/favorites?user_id=eq.${userId}&product_id=eq.${productId}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        return response.ok;
    } catch (error) {
        console.error('Remove favorite error:', error);
        return false;
    }
}