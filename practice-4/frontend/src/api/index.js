import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:3000/api",  // твой сервер на порту 3000
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

// Перехватчик для обработки ошибок
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Сервер ответил с ошибкой
            console.error(`Ошибка ${error.response.status}:`, error.response.data);

            // Можно добавить специфичные сообщения для разных статусов
            switch (error.response.status) {
                case 400:
                    console.error("Неверные данные запроса");
                    break;
                case 404:
                    console.error("Автомобиль не найден");
                    break;
                case 500:
                    console.error("Ошибка сервера");
                    break;
                default:
                    console.error("Произошла ошибка");
            }
        } else if (error.request) {
            // Запрос был отправлен, но ответа нет
            console.error("Сервер не отвечает. Проверь, запущен ли бэкенд на порту 3000");
        } else {
            // Ошибка при настройке запроса
            console.error("Ошибка запроса:", error.message);
        }
        return Promise.reject(error);
    }
);

export const api = {
    // Получить все автомобили
    getCars: async () => {
        try {
            const response = await apiClient.get("/cars");
            return response.data;
        } catch (error) {
            console.error("Ошибка при загрузке автомобилей:", error);
            throw error;
        }
    },

    // Получить один автомобиль по ID
    getCarById: async (id) => {
        try {
            const response = await apiClient.get(`/cars/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Ошибка при загрузке автомобиля с id ${id}:`, error);
            throw error;
        }
    },

    // Создать новый автомобиль
    createCar: async (car) => {
        try {
            const response = await apiClient.post("/cars", car);
            return response.data;
        } catch (error) {
            console.error("Ошибка при создании автомобиля:", error);
            throw error;
        }
    },

    // Обновить автомобиль
    updateCar: async (id, car) => {
        try {
            const response = await apiClient.patch(`/cars/${id}`, car);
            return response.data;
        } catch (error) {
            console.error(`Ошибка при обновлении автомобиля с id ${id}:`, error);
            throw error;
        }
    },

    // Удалить автомобиль
    deleteCar: async (id) => {
        try {
            const response = await apiClient.delete(`/cars/${id}`);
            return response.data; // для 204 статуса вернет пустой объект
        } catch (error) {
            console.error(`Ошибка при удалении автомобиля с id ${id}:`, error);
            throw error;
        }
    },

    // Дополнительно: поиск автомобилей по категории (можно добавить на бэкенд позже)
    getCarsByCategory: async (category) => {
        try {
            const allCars = await api.getCars();
            return allCars.filter(car =>
                car.category.toLowerCase().includes(category.toLowerCase())
            );
        } catch (error) {
            console.error("Ошибка при поиске автомобилей:", error);
            throw error;
        }
    }
};