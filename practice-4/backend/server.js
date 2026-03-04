const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');

// Подключаем Swagger
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const server = express();
const port = 3000;

let cars = [
    {
        id: nanoid(6),
        name: "Ferrari F8 Tributo",
        category: "Суперкар",
        description: "3.9-литровый V8 твин-турбо, 720 л.с., разгон до 100 км/ч за 2.9 секунды",
        price: 275000,
        stock: 3
    },
    {
        id: nanoid(6),
        name: "Lamborghini Huracán EVO",
        category: "Суперкар",
        description: "5.2-литровый V10, 640 л.с., полный привод, максимальная скорость 325 км/ч",
        price: 245000,
        stock: 5
    },
    {
        id: nanoid(6),
        name: "Porsche 911 Turbo S",
        category: "Спорткар",
        description: "3.7-литровый оппозитный двигатель, 650 л.с., разгон до 100 км/ч за 2.7 секунды",
        price: 207000,
        stock: 7
    },
    {
        id: nanoid(6),
        name: "McLaren 720S",
        category: "Суперкар",
        description: "4.0-литровый V8 твин-турбо, 720 л.с., карбоновый монокок",
        price: 299000,
        stock: 2
    },
    {
        id: nanoid(6),
        name: "Chevrolet Corvette C8",
        category: "Спорткар",
        description: "6.2-литровый V8, 502 л.с., среднемоторная компоновка",
        price: 89000,
        stock: 12
    },
    {
        id: nanoid(6),
        name: "Aston Martin Vantage",
        category: "Гран туризмо",
        description: "4.0-литровый V8 твин-турбо Mercedes-AMG, 535 л.с., роскошный салон",
        price: 155000,
        stock: 4
    },
    {
        id: nanoid(6),
        name: "Nissan GT-R R35",
        category: "Спорткар",
        description: "3.8-литровый V6 твин-турбо, 570 л.с., полный привод, прозвище 'Годзилла'",
        price: 115000,
        stock: 8
    },
    {
        id: nanoid(6),
        name: "Audi R8 V10",
        category: "Суперкар",
        description: "5.2-литровый V10, 620 л.с., полный привод Quattro, звук невероятный",
        price: 170000,
        stock: 6
    },
    {
        id: nanoid(6),
        name: "BMW M4 Competition",
        category: "Спорткар",
        description: "3.0-литровый рядный 6-цилиндровый твин-турбо, 510 л.с., задний привод",
        price: 78000,
        stock: 15
    },
    {
        id: nanoid(6),
        name: "Ford Mustang Shelby GT500",
        category: "Маслкар",
        description: "5.2-литровый V8 с наддувом, 760 л.с., механическая коробка передач",
        price: 80000,
        stock: 9
    },
    {
        id: nanoid(6),
        name: "Bugatti Chiron",
        category: "Гиперкар",
        description: "8.0-литровый W16, 1500 л.с., максимальная скорость 420+ км/ч",
        price: 3000000,
        stock: 1
    },
    {
        id: nanoid(6),
        name: "Toyota Supra",
        category: "Японский спорткар",
        description: "3.0-литровый рядный 6-цилиндровый турбо, 387 л.с., легендарная надежность",
        price: 55000,
        stock: 14
    },
    {
        id: nanoid(6),
        name: "Mazda MX-5 Miata",
        category: "Родстер",
        description: "2.0-литровый атмосферный, 181 л.с., идеальная управляемость",
        price: 32000,
        stock: 20
    },
    {
        id: nanoid(6),
        name: "Lotus Emira",
        category: "Спорткар",
        description: "3.5-литровый V6 с наддувом, 400 л.с., минимальный вес",
        price: 95000,
        stock: 5
    },
    {
        id: nanoid(6),
        name: "Mercedes-AMG GT",
        category: "Гран туризмо",
        description: "4.0-литровый V8 битурбо, 585 л.с., длинный капот",
        price: 135000,
        stock: 7
    },
];

// CORS
server.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    credentials: true
}));

// Middleware для парсинга JSON
server.use(express.json());

// Middleware для логирования запросов
server.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            console.log('Body:', req.body);
        }
    });
    next();
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Car:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - description
 *         - price
 *         - stock
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный ID автомобиля
 *         name:
 *           type: string
 *           description: Название модели
 *         category:
 *           type: string
 *           description: Категория (Суперкар, Спорткар и т.д.)
 *         description:
 *           type: string
 *           description: Описание автомобиля
 *         price:
 *           type: number
 *           description: Цена в долларах
 *         stock:
 *           type: integer
 *           description: Количество на складе
 *       example:
 *         id: "abc123"
 *         name: "Ferrari F8 Tributo"
 *         category: "Суперкар"
 *         description: "3.9-литровый V8 твин-турбо, 720 л.с., разгон до 100 км/ч за 2.9 секунды"
 *         price: 275000
 *         stock: 3
 */

// Swagger definition
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API автосалона',
            version: '1.0.0',
            description: 'API для управления автомобилями',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Локальный сервер',
            },
        ],
    },
    // Путь к файлам с JSDoc-комментариями
    apis: ['./server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Подключаем Swagger UI по адресу /api-docs
server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Функция-помощник для получения автомобиля из списка
function findCarOr404(id, res) {
    const car = cars.find(c => c.id === id);
    if (!car) {
        res.status(404).json({error: "Car not found"});
        return null;
    }
    return car;
}

/**
 * @swagger
 * /api/cars:
 *   post:
 *     summary: Создает новый автомобиль
 *     tags: [Cars]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - description
 *               - price
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Автомобиль создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       400:
 *         description: Неверные данные (обязательные поля не заполнены)
 */

server.post("/api/cars", (req, res) => {
    const {name, category, description, price, stock} = req.body;

    if (!name || !category || !description ||
        price === undefined || price === null ||
        stock === undefined || stock === null) {
        return res.status(400).json({error: "All fields are required"});
    }

    if (Number(price) < 0 || Number(stock) < 0) {
        return res.status(400).json({error: "Price and stock cannot be negative"});
    }

    const newCar = {
        id: nanoid(6),
        name: name.trim(),
        category: category.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock)
    };

    cars.push(newCar);
    res.status(201).json(newCar);
});

/**
 * @swagger
 * /api/cars:
 *   get:
 *     summary: Возвращает список всех автомобилей
 *     tags: [Cars]
 *     responses:
 *       200:
 *         description: Список автомобилей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Car'
 */

server.get("/api/cars", (req, res) => {
    res.status(200).json(cars);
});

/**
 * @swagger
 * /api/cars/{id}:
 *   get:
 *     summary: Получает автомобиль по ID
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID автомобиля
 *     responses:
 *       200:
 *         description: Данные автомобиля
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       404:
 *         description: Автомобиль не найден
 */

server.get("/api/cars/:id", (req, res) => {
    const id = req.params.id;
    const car = findCarOr404(id, res);
    if (!car) return;
    res.status(200).json(car);
});

/**
 * @swagger
 * /api/cars/{id}:
 *   patch:
 *     summary: Обновляет данные автомобиля
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID автомобиля
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Обновленный автомобиль
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       400:
 *         description: Нет данных для обновления
 *       404:
 *         description: Автомобиль не найден
 */

server.patch("/api/cars/:id", (req, res) => {
    const id = req.params.id;
    const car = findCarOr404(id, res);
    if (!car) return;
    // Запрет на PATCH без полей
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({error: "Nothing to update"});
    }
    const {name, category, description, price, stock} = req.body;
    // Обновляем только те поля, которые переданы
    if (name !== undefined) car.name = name.trim();
    if (category !== undefined) car.category = category.trim();
    if (description !== undefined) car.description = description.trim();
    if (price !== undefined) car.price = Number(price);
    if (stock !== undefined) car.stock = Number(stock);
    res.json(car);
});

/**
 * @swagger
 * /api/cars/{id}:
 *   delete:
 *     summary: Удаляет автомобиль
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID автомобиля
 *     responses:
 *       204:
 *         description: Автомобиль успешно удален (нет тела ответа)
 *       404:
 *         description: Автомобиль не найден
 */

server.delete("/api/cars/:id", (req, res) => {
    const id = req.params.id;
    const exists = cars.some((c) => c.id === id);
    if (!exists) return res.status(404).json({error: "Car not found"});
    cars = cars.filter((c) => c.id !== id);
    res.status(204).send();
});

// 404 для всех остальных маршрутов
server.use((req, res) => {
    res.status(404).json({error: "Not found"});
});

// Глобальный обработчик ошибок (чтобы сервер не падал)
server.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({error: "Internal server error"});
});

// Запуск сервера
server.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log(`Swagger документация: http://localhost:${port}/api-docs`);
});