const express = require('express');
const {nanoid} = require('nanoid');
const bcrypt = require('bcrypt');
const cors = require('cors');
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const jwt = require("jsonwebtoken");
const app = express();
const ACCESS_EXPIRES_IN = "15m";
const JWT_SECRET = "my_secret_token";
const port = 3000;
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Products API",
            version: "1.0.0",
            description: "API для пользователей и товаров (JWT Auth)",
        },
        servers: [
            {
                url: "http://localhost:3000"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },
    apis: ["./app.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

let users = []

let products = [
    {
        productID: nanoid(6),
        productTitle: "Перчатки для бокса",
        productCategory: "Товары для спорта",
        productDescription: "Натуральная кожа, 12 унций, красный цвет",
        productPrice: 2500
    },
]

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    credentials: true
}));

app.use(express.json());

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

function findUserByEmail(userEmail) {
    return users.find(u => u.userEmail === userEmail);
}

function findProductByID(productID) {
    return products.find(p => p.productID === productID);
}

function findUserByID(userID) {
    return users.find(u => u.userID === userID);
}

function authMiddleware(req, res, next) {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            error: "Ошибка аутентификации",
        });
    }

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({
            error: "Ошибка токена."
        });
    }
}


/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - surname
 *         - name
 *         - email
 *         - password
 *       properties:
 *         surname:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *
 *     ProductRequest:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - description
 *         - price
 *       properties:
 *         title:
 *           type: string
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *
 *     ProductPatchRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *       description: Все поля опциональны, обновляются только переданные
 *
 *     Product:
 *       type: object
 *       properties:
 *         productID:
 *           type: string
 *         productTitle:
 *           type: string
 *         productCategory:
 *           type: string
 *         productDescription:
 *           type: string
 *         productPrice:
 *           type: number
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Регистрация пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Пользователь создан
 *       400:
 *         description: Ошибка данных
 *       409:
 *         description: Email уже существует
 */

app.post("/users/register", async (req, res) => {
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
        userID: nanoid(6),
        userSurname: surname.trim(),
        userName: name.trim(),
        userEmail: email.trim(),
        userPassword: await hashPassword(password)
    }
    users.push(newUser);
    return res.status(201).json({message: "Пользователь зарегистрирован."});
})

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Авторизация пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Успешный вход
 *       401:
 *         description: Ошибка авторизации
 */

app.post("/users/login", async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({error: "Заполните необходимые поля."})
    }

    const user = findUserByEmail(email);
    if (!user) {
        return res.status(404).json({error: "Пользователь не найден."})
    }

    const isAuth = await verifyPassword(password, user.userPassword);
    if (!isAuth) {
        return res.status(401).json({error: "Ошибка авторизации."})
    }

    const accessToken = jwt.sign(
        {
            sub: user.userID,
        },
        JWT_SECRET,
        {
            expiresIn: ACCESS_EXPIRES_IN,
        }
    );

    return res.status(200).json({message: "Успешный вход.", token: accessToken})
})

/**
 * @swagger
 * /users/auth/me:
 *   get:
 *     summary: Получить текущего пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Текущий пользователь
 *       401:
 *         description: Unauthorized
 */

app.get("/users/auth/me", authMiddleware, (req, res) => {
    const userID = req.user.sub;
    const user = findUserByID(userID);

    if (!user) {
        return res.status(404).json({error: "Пользователь не найден."});
    }

    return res.status(200).json({
        id: user.userID,
        email: user.userEmail
    });
})

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Создать товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductRequest'
 *     responses:
 *       201:
 *         description: Товар создан
 */

app.post("/products", (req, res) => {
    const {title, category, description, price} = req.body;
    if (!title || !category || !description || price === undefined) {
        return res.status(400).json({error: "Заполните необходимые поля."})
    }

    const newProduct = {
        productID: nanoid(6),
        productTitle: title.trim(),
        productCategory: category.trim(),
        productDescription: description.trim(),
        productPrice: Number(price)
    }
    products.push(newProduct);
    return res.status(201).json({message: "Товар добавлен."})
})

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Обновить товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductRequest'
 *     responses:
 *       200:
 *         description: Товар обновлен
 *       404:
 *         description: Товар не найден
 */

app.put("/products/:id", authMiddleware, (req, res) => {
    const {title, category, description, price} = req.body;

    if (!title || !category || !description || price === undefined) {
        return res.status(400).json({error: "Заполните необходимые поля."});
    }

    const product = findProductByID(req.params.id);

    if (!product) {
        return res.status(404).json({error: "Товар не найден"});
    }

    product.productTitle = title.trim();
    product.productCategory = category.trim();
    product.productDescription = description.trim();
    product.productPrice = Number(price);

    return res.status(200).json({message: "Товар обновлен."});
});

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Частичное обновление товара
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductPatchRequest'
 *           example:
 *             title: "Обновленное название"
 *             price: 3000
 *     responses:
 *       200:
 *         description: Товар частично обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Некорректные данные (например, price не число)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Товар не найден
 */

app.patch("/products/:id", authMiddleware, (req, res) => {
    const {title, category, description, price} = req.body;
    const product = findProductByID(req.params.id);

    if (!product) {
        return res.status(404).json({error: "Товар не найден."});
    }

    if (price !== undefined && isNaN(Number(price))) {
        return res.status(400).json({error: "Price должен быть числом."});
    }

    if (title !== undefined) {
        product.productTitle = title.trim();
    }

    if (category !== undefined) {
        product.productCategory = category.trim();
    }

    if (description !== undefined) {
        product.productDescription = description.trim();
    }

    if (price !== undefined) {
        product.productPrice = Number(price);
    }

    return res.status(200).json({message: "Товар частично обновлен."});
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Товар удален
 *       404:
 *         description: Товар не найден
 */

app.delete("/products/:id", authMiddleware, (req, res) => {
    const productIndex = products.findIndex(p => p.productID === req.params.id);

    if (productIndex === -1) {
        return res.status(404).json({error: "Товар не найден"});
    }

    products.splice(productIndex, 1);
    return res.status(200).json({message: "Товар удален."})
})

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Получить список товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 */

app.get('/products', (req, res) => {
    return res.status(200).json(products);
})

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Товар найден
 *       404:
 *         description: Товар не найден
 */

app.get('/products/:id', authMiddleware, (req, res) => {
    const product = findProductByID(req.params.id);
    if (!product) {
        return res.status(404).json({error: 'Товар не найден'});
    }
    return res.status(200).json(product);
})

/**
 * @swagger
 * /:
 *   get:
 *     summary: Проверка работы сервера
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Сервер работает
 */

app.get('/', (req, res) => {
    res.status(200).json({message: "Сервер запущен."})
})

app.listen(port, () => {
    console.log(`Sever: http://localhost:${port}`)
    console.log(`Swagger: http://localhost:${port}/docs`)
})