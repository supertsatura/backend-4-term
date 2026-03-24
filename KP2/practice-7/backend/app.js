const express = require('express');
const {nanoid} = require('nanoid');
const bcrypt = require('bcrypt');
const cors = require('cors');
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const app = express();
const port = 3000;

let users = []

let products = [
    {
        product_id: nanoid(6),
        product_title: "Перчатки для бокса",
        product_category: "Спорт и отдых",
        product_description: "Натуральная кожа, красный цвет, 12 унций",
        product_price: 3500
    },
]

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    credentials: true
}));

app.use(express.json());


const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API для интернет-магазина",
            version: "1.0.0",
            description: "REST API для управления пользователями и товарами",
            contact: {
                name: "API Support",
                email: "support@example.com"
            }
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: "Локальный сервер разработки"
            }
        ],
        components: {
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        user_id: {
                            type: "string",
                            description: "Уникальный ID пользователя",
                            example: "abc123"
                        },
                        user_surname: {
                            type: "string",
                            description: "Фамилия пользователя",
                            example: "Иванов"
                        },
                        user_name: {
                            type: "string",
                            description: "Имя пользователя",
                            example: "Иван"
                        },
                        user_email: {
                            type: "string",
                            description: "Email пользователя",
                            example: "ivan@example.com"
                        }
                    }
                },
                UserRegister: {
                    type: "object",
                    required: ["surname", "name", "email", "password"],
                    properties: {
                        surname: {
                            type: "string",
                            description: "Фамилия пользователя",
                            example: "Иванов"
                        },
                        name: {
                            type: "string",
                            description: "Имя пользователя",
                            example: "Иван"
                        },
                        email: {
                            type: "string",
                            description: "Email пользователя",
                            example: "ivan@example.com"
                        },
                        password: {
                            type: "string",
                            description: "Пароль (минимум 10 символов)",
                            example: "password12345"
                        }
                    }
                },
                UserLogin: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: {
                            type: "string",
                            description: "Email пользователя",
                            example: "ivan@example.com"
                        },
                        password: {
                            type: "string",
                            description: "Пароль",
                            example: "password12345"
                        }
                    }
                },
                Product: {
                    type: "object",
                    properties: {
                        product_id: {
                            type: "string",
                            description: "Уникальный ID товара",
                            example: "xyz789"
                        },
                        product_title: {
                            type: "string",
                            description: "Название товара",
                            example: "Перчатки для бокса"
                        },
                        product_category: {
                            type: "string",
                            description: "Категория товара",
                            example: "Товары для спорта"
                        },
                        product_description: {
                            type: "string",
                            description: "Описание товара",
                            example: "Натуральная кожа, 12 унций, красный цвет"
                        },
                        product_price: {
                            type: "number",
                            description: "Цена товара в рублях",
                            example: 2500
                        }
                    }
                },
                ProductCreate: {
                    type: "object",
                    required: ["title", "category", "description", "price"],
                    properties: {
                        title: {
                            type: "string",
                            description: "Название товара",
                            example: "Перчатки для бокса"
                        },
                        category: {
                            type: "string",
                            description: "Категория товара",
                            example: "Товары для спорта"
                        },
                        description: {
                            type: "string",
                            description: "Описание товара",
                            example: "Натуральная кожа, 12 унций, красный цвет"
                        },
                        price: {
                            type: "number",
                            description: "Цена товара в рублях",
                            example: 2500
                        }
                    }
                },
                Error: {
                    type: "object",
                    properties: {
                        error: {
                            type: "string",
                            description: "Сообщение об ошибке"
                        }
                    }
                },
                Message: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            description: "Сообщение об успешной операции"
                        }
                    }
                }
            }
        },
        tags: [
            {
                name: "Пользователи",
                description: "Операции с пользователями"
            },
            {
                name: "Товары",
                description: "Операции с товарами"
            },
            {
                name: "Система",
                description: "Системные операции"
            }
        ]
    },
    apis: [__filename] // Используем текущий файл
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            console.log('Body:', req.body);
        }
    });
    next();
});

async function hashPassword(password) {
    const rounds = 10;
    return bcrypt.hash(password, rounds);
}

async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}

function findUserByEmail(user_email) {
    return users.find(u => u.user_email === user_email);
}

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Пользователи]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Ошибка валидации данных
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Пользователь с таким email уже существует
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

app.post("/api/users/register", async (req, res) => {
    const {surname, name, email, password} = req.body;
    if (!surname || !name || !email || !password) {
        return res.status(400).json({error: "Заполните необходимые поля."});
    }

    if (findUserByEmail(email)) {
        return res.status(409).json({
            error: "Пользователь с таким email уже существует."
        });
    }

    if (password.length < 10) {
        return res.status(400).json({error: "Длина пароля меньше 10-ти символов."})
    }

    const newUser = {
        user_id: nanoid(6),
        user_surname: surname.trim(),
        user_name: name.trim(),
        user_email: email.trim(),
        user_password: await hashPassword(password)
    }
    users.push(newUser);
    return res.status(201).json({message: "Пользователь зарегистрирован."});
})

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Вход в систему
 *     tags: [Пользователи]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Не заполнены обязательные поля
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Ошибка авторизации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Пользователь не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

app.post("/api/users/login", async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({error: "Заполните необходимые поля."})
    }

    const user = findUserByEmail(email);
    if (!user) {
        return res.status(404).json({error: "Пользователь не найден."})
    }

    const isAuth = await verifyPassword(password, user.user_password);
    if (!isAuth) {
        return res.status(401).json({error: "Ошибка авторизации."})
    }
    return res.status(200).json({message: "Успешный вход."})
})

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Добавление нового товара
 *     tags: [Товары]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreate'
 *     responses:
 *       201:
 *         description: Товар успешно добавлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Ошибка валидации данных
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

app.post("/api/products", (req, res) => {
    const {title, category, description, price} = req.body;
    if (!title || !category || !description || price === undefined) {
        return res.status(400).json({error: "Заполните необходимые поля."})
    }

    const newProduct = {
        product_id: nanoid(6),
        product_title: title.trim(),
        product_category: category.trim(),
        product_description: description.trim(),
        product_price: Number(price)
    }
    products.push(newProduct);
    return res.status(201).json({message: "Товар добавлен."})
})

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список всех товаров
 *     tags: [Товары]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */

app.get('/api/products', (req, res) => {
    return res.status(200).json(products);
})

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags: [Товары]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Информация о товаре
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.product_id === req.params.id);
    if (!product) {
        return res.status(404).json({error: 'Товар не найден'});
    }
    return res.status(200).json(product);
})

/**
 * @swagger
 * /:
 *   get:
 *     summary: Проверка статуса сервера
 *     tags: [Система]
 *     responses:
 *       200:
 *         description: Сервер работает
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 */

app.get('/', (req, res) => {
    res.status(200).json({message: "Сервер запущен."})
})

app.use((req, res) => {
    res.status(404).json({error: "Not found"});
});

app.use((err, req, res, next) => {
    console.error("Необработанный запрос:", err);
    res.status(500).json({error: "Internal server error"});
});

app.listen(port, () => {
    console.log(`Server: http://localhost:${port}`)
    console.log(`Swagger: http://localhost:${port}/docs`)
})

