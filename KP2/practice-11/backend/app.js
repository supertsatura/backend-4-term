const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const ACCESS_SECRET = 'access_secret';
const REFRESH_SECRET = 'refresh_secret';
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';
const PORT = 3000;

// In-memory storage
let users = [];
const refreshTokens = new Set();

let products = [
    {
        productID: 1,
        productTitle: 'Перчатки для бокса',
        productCategory: 'Товары для спорта',
        productDescription: 'Натуральная кожа, 12 унций, красный цвет',
        productPrice: 2500,
    },
];

// Middleware
app.use(
    cors({
        origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
        credentials: true,
    })
);
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            console.log('Body:', req.body);
        }
    });
    next();
});

// Utility functions
async function hashPassword(password) {
    const rounds = 10;
    return bcrypt.hash(password, rounds);
}

async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}

function findUserByUsername(username) {
    return users.find((u) => u.userName === username);
}

function findUserByEmail(userEmail) {
    return users.find((u) => u.userEmail === userEmail);
}

function findProductByID(productID) {
    return products.find((p) => p.productID === Number(productID));
}

function findUserByID(userID) {
    return users.find((u) => u.userID === Number(userID));
}

// Authentication middleware
function authMiddleware(req, res, next) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({
            error: 'Authentication failed',
        });
    }

    try {
        req.user = jwt.verify(token, ACCESS_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({
            error: 'Invalid or expired token.',
        });
    }
}

// Role middleware
function roleMiddleware(allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: "Forbidden",
            });
        }
        next();
    };
}

// Token generation functions
function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user.userID,
            username: user.username,
        },
        ACCESS_SECRET,
        {
            expiresIn: ACCESS_EXPIRES_IN,
        }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        {
            sub: user.userID,
            username: user.username,
        },
        REFRESH_SECRET,
        {
            expiresIn: REFRESH_EXPIRES_IN,
        }
    );
}

// Routes

// Auth routes
app.post('/api/auth/register', async (req, res) => {
    const {username, password, role} = req.body;

    if (!username || !password) {
        return res.status(400).json({error: 'All fields are required.'});
    }

    if (findUserByUsername(username)) {
        return res.status(409).json({
            error: 'User with this email already exists.',
        });
    }

    // if (password.length < 10) {
    //     return res.status(400).json({error: 'Password must be at least 10 characters long.'});
    // }

    const newUser = {
        id: users.length + 1,
        userName: username.trim(),
        userPassword: await hashPassword(password),
        userRole: role || 'user'
    };
    users.push(newUser);

    return res.status(201).json({message: 'User registered successfully.'});
});

app.post('/api/auth/login', async (req, res) => {
    const {username, password} = req.body;

    if (!username || !password) {
        return res.status(400).json({error: 'All fields are required.'});
    }

    const user = findUserByUsername(username);
    if (!user) {
        return res.status(401).json({error: 'Invalid credentials.'});
    }

    const isAuth = await verifyPassword(password, user.userPassword);
    if (!isAuth) {
        return res.status(401).json({error: 'Invalid credentials.'});
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    refreshTokens.add(refreshToken);

    return res.status(200).json({
        accessToken,
        refreshToken,
    });
});

// app.get('/api/auth/me', authMiddleware, (req, res) => {
//     const userID = req.user.sub;
//     const user = findUserByID(userID);
//
//     if (!user) {
//         return res.status(404).json({error: 'User not found.'});
//     }
//
//     return res.status(200).json({
//         id: user.userID,
//         email: user.userEmail,
//     });
// });

app.post('/api/auth/refresh', (req, res) => {
    const {refreshToken} = req.body;

    if (!refreshToken) {
        return res.status(400).json({
            error: 'Refresh token is required.',
        });
    }

    if (!refreshTokens.has(refreshToken)) {
        return res.status(401).json({
            error: 'Invalid refresh token.',
        });
    }

    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);
        const user = findUserByID(payload.sub);

        if (!user) {
            return res.status(401).json({
                error: 'User not found.',
            });
        }

        refreshTokens.delete(refreshToken);

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        refreshTokens.add(newRefreshToken);

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (err) {
        return res.status(401).json({
            error: 'Invalid or expired refresh token.',
        });
    }
});

// User role routes
app.get('api/protected-route', authMiddleware, roleMiddleware(['seller', 'admin']),
    (req, res) => {
        return res.status(200).json({
            message: 'Protected route for seller or admin.',
            user: req.user
        })
    });

app.get('api/protected-admin-route', authMiddleware, roleMiddleware(['admin']),
    (req, res) => {
        return res.status(200).json({
            message: 'Protected route for admin.',
            user: req.user
        })
    });

// Product routes
app.post('/api/auth/products', authMiddleware, (req, res) => {
    const {title, category, description, price} = req.body;

    if (!title || !category || !description || price === undefined) {
        return res.status(400).json({error: 'All fields are required.'});
    }

    const newProduct = {
        productID: products.length + 1,
        productTitle: title.trim(),
        productCategory: category.trim(),
        productDescription: description.trim(),
        productPrice: Number(price),
    };
    products.push(newProduct);

    return res.status(201).json({message: 'Product added successfully.'});
});

app.put('/api/auth/products/:id', authMiddleware, (req, res) => {
    const {title, category, description, price} = req.body;

    if (!title || !category || !description || price === undefined) {
        return res.status(400).json({error: 'All fields are required.'});
    }

    const product = findProductByID(req.params.id);

    if (!product) {
        return res.status(404).json({error: 'Product not found'});
    }

    product.productTitle = title.trim();
    product.productCategory = category.trim();
    product.productDescription = description.trim();
    product.productPrice = Number(price);

    return res.status(200).json({message: 'Product updated successfully.'});
});

app.patch('/api/auth/products/:id', authMiddleware, (req, res) => {
    const {title, category, description, price} = req.body;
    const product = findProductByID(req.params.id);

    if (!product) {
        return res.status(404).json({error: 'Product not found.'});
    }

    if (price !== undefined && isNaN(Number(price))) {
        return res.status(400).json({error: 'Price must be a number.'});
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

    return res.status(200).json({message: 'Product partially updated successfully.'});
});

app.delete('/api/auth/products/:id', authMiddleware, (req, res) => {
    const productIndex = products.findIndex((p) => p.productID === Number(req.params.id));

    if (productIndex === -1) {
        return res.status(404).json({error: 'Product not found'});
    }

    products.splice(productIndex, 1);
    return res.status(200).json({message: 'Product deleted successfully.'});
});

app.get('/api/auth/products', (req, res) => {
    return res.status(200).json(products);
});

app.get('/api/auth/products/:id', authMiddleware, (req, res) => {
    const product = findProductByID(req.params.id);

    if (!product) {
        return res.status(404).json({error: 'Product not found'});
    }

    return res.status(200).json(product);
});

// Root route
app.get('/', (req, res) => {
    res.status(200).json({message: 'Server is running.'});
});

// Start server
app.listen(PORT, () => {
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`Swagger: http://localhost:${PORT}/docs`);
});
