// ========== НАСТРОЙКИ SUPABASE ==========
const SUPABASE_URL = 'https://gyrysnmymvwdmpeifhdk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UMVS8JunhUJFyIloGMqlxQ_UUWD8eXG';

// ========== РЕГИСТРАЦИЯ ==========
async function supabaseRegister(name, email, password) {
    try {
        console.log('1. Регистрация:', { name, email });
        
        // Проверяем, есть ли пользователь с таким email
        const checkUrl = `${SUPABASE_URL}/rest/v1/client?email=eq.${encodeURIComponent(email)}`;
        console.log('2. Проверка URL:', checkUrl);
        
        const checkRes = await fetch(checkUrl, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        
        console.log('3. Статус проверки:', checkRes.status);
        const existing = await checkRes.json();
        console.log('4. Существующие:', existing);
        
        if (existing && existing.length > 0) {
            return { success: false, message: 'Email уже используется' };
        }
        
        // Создаём пользователя
        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/client`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, passw: password })
        });
        
        console.log('5. Статус вставки:', insertRes.status);
        
        if (insertRes.status === 201 || insertRes.status === 200) {
            console.log('6. Успешно!');
            return { 
                success: true, 
                user: { id: Date.now(), name, email, passw: password }
            };
        } else {
            const errorText = await insertRes.text();
            console.error('7. Ошибка:', errorText);
            return { success: false, message: `Ошибка ${insertRes.status}: ${errorText}` };
        }
        
    } catch (error) {
        console.error('Register error:', error);
        return { success: false, message: error.message };
    }
}

// ========== ВХОД ==========
async function supabaseLogin(login, password) {
    try {
        console.log('1. Вход:', login);
        
        const res = await fetch(`${SUPABASE_URL}/rest/v1/client`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        
        console.log('2. Статус:', res.status);
        const users = await res.json();
        console.log('3. Пользователи:', users);
        
        const user = users.find(u => (u.name === login || u.email === login) && u.passw === password);
        
        if (user) {
            return { success: true, user };
        }
        return { success: false, message: 'Неверный логин или пароль' };
        
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: error.message };
    }
}

// ========== ПОЛУЧИТЬ ТОВАРЫ ==========
async function supabaseGetProducts() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        return await res.json();
    } catch (error) {
        console.error('Get products error:', error);
        return [];
    }
}

// Для совместимости со старым кодом
window.supabaseRegister = supabaseRegister;
window.supabaseLogin = supabaseLogin;
window.supabaseGetProducts = supabaseGetProducts;

console.log('Supabase.js загружен!');
