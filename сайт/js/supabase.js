// ========== НАСТРОЙКИ SUPABASE ==========
const SUPABASE_URL = 'https://gyrysnmymvwdmpeifhdk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UMVS8JunhUJFyIloGMqlxQ_UUWD8eXG';

// ========== ПРЯМЫЕ ЗАПРОСЫ (без сложных обёрток) ==========

// РЕГИСТРАЦИЯ
async function supabaseRegister(name, email, password) {
    try {
        console.log('Регистрация:', { name, email });
        
        // Проверяем, есть ли уже такой email
        const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/client?email=eq.${email}`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        
        const existing = await checkRes.json();
        console.log('Существующие пользователи:', existing);
        
        if (existing && existing.length > 0) {
            return { success: false, message: 'Email уже используется' };
        }
        
        // Создаём нового пользователя
        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/client`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, passw: password })
        });
        
        console.log('Статус ответа:', insertRes.status);
        
        if (!insertRes.ok) {
            const errorText = await insertRes.text();
            console.error('Ошибка:', errorText);
            return { success: false, message: `Ошибка ${insertRes.status}: ${errorText}` };
        }
        
        // Пробуем получить результат
        let result;
        try {
            result = await insertRes.json();
        } catch(e) {
            result = { message: 'Пользователь создан' };
        }
        
        console.log('Результат:', result);
        return { success: true, user: { name, email, id: Date.now() } };
        
    } catch (error) {
        console.error('Register error:', error);
        return { success: false, message: error.message };
    }
}

// ВХОД
async function supabaseLogin(login, password) {
    try {
        console.log('Вход:', login);
        
        // Ищем пользователя по имени или email
        const res = await fetch(`${SUPABASE_URL}/rest/v1/client`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        
        const users = await res.json();
        console.log('Все пользователи:', users);
        
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

// ПОЛУЧИТЬ ТОВАРЫ
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
