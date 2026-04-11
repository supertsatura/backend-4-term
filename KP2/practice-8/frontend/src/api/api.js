import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:3000",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

// Функция для установки токена авторизации
export const setAuthToken = (token) => {
    if (token) {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete apiClient.defaults.headers.common["Authorization"];
    }
};

// Перехватчик для обработки ошибок
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Сервер ответил с ошибкой
            console.error(`Ошибка ${error.response.status}:`, error.response.data);

            // Специфичные сообщения для разных статусов
            switch (error.response.status) {
                case 400:
                    console.error("Неверные данные запроса.");
                    break;
                case 401:
                    console.error("Пользователь не авторизован.");
                    // Можно автоматически очистить токен
                    setAuthToken(null);
                    break;
                case 404:
                    console.error("Ресурс не найден.");
                    break;
                case 409:
                    console.error("Пользователь с таким email уже существует.");
                    break;
                case 500:
                    console.error("Ошибка сервера.");
                    break;
                default:
                    console.error("Произошла ошибка.");
            }
        } else if (error.request) {
            console.error("Сервер не отвечает.");
        } else {
            console.error("Ошибка запроса:", error.message);
        }
        return Promise.reject(error);
    }
);

export const api = {
    // ========== USERS ==========

    // Регистрация пользователя
    register: async (userData) => {
        try {
            const response = await apiClient.post("/users/register", {
                surname: userData.surname,
                name: userData.name,
                email: userData.email,
                password: userData.password
            });
            return response.data;
        } catch (error) {
            console.error("Ошибка при регистрации:", error);
            throw error;
        }
    },

    // Авторизация пользователя
    login: async (email, password) => {
        try {
            const response = await apiClient.post("/users/login", { email, password });
            // Сохраняем токен
            if (response.data.token) {
                setAuthToken(response.data.token);
            }
            return response.data;
        } catch (error) {
            console.error("Ошибка при входе:", error);
            throw error;
        }
    },

    // Получить информацию о текущем пользователе
    getCurrentUser: async () => {
        try {
            const response = await apiClient.get("/users/auth/me");
            return response.data;
        } catch (error) {
            console.error("Ошибка при получении данных пользователя:", error);
            throw error;
        }
    },

    // Выход из системы
    logout: () => {
        setAuthToken(null);
    },

    // ========== PRODUCTS ==========

    // Получить все товары
    getProducts: async () => {
        try {
            const response = await apiClient.get("/products");
            return response.data;
        } catch (error) {
            console.error("Ошибка при загрузке товаров:", error);
            throw error;
        }
    },

    // Получить товар по ID
    getProductById: async (id) => {
        try {
            const response = await apiClient.get(`/products/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Ошибка при загрузке товара с id ${id}:`, error);
            throw error;
        }
    },

    // Создать новый товар (не требует авторизации по документации, но можно добавить)
    createProduct: async (product) => {
        try {
            const response = await apiClient.post("/products", {
                title: product.title,
                category: product.category,
                description: product.description,
                price: product.price
            });
            return response.data;
        } catch (error) {
            console.error("Ошибка при создании товара:", error);
            throw error;
        }
    },

    // Обновить товар (требуется авторизация)
    updateProduct: async (id, product) => {
        try {
            const response = await apiClient.put(`/products/${id}`, product);
            return response.data;
        } catch (error) {
            console.error(`Ошибка при обновлении товара с id ${id}:`, error);
            throw error;
        }
    },

    // Удалить товар (требуется авторизация)
    deleteProduct: async (id) => {
        try {
            const response = await apiClient.delete(`/products/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Ошибка при удалении товара с id ${id}:`, error);
            throw error;
        }
    },

    // ========== SYSTEM ==========

    // Проверка работы сервера
    checkServer: async () => {
        try {
            const response = await apiClient.get("/");
            return response.data;
        } catch (error) {
            console.error("Сервер не отвечает:", error);
            throw error;
        }
    }
};

// Экспортируем также сам apiClient для прямого использования при необходимости
export default apiClient;