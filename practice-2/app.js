// инициализация сервера
const express = require('express');
const app = express();
const port = 3000;

// массив объектов (товары)
let products = [
    {id: 1, name: 'Хлеб', price: 20},
    {id: 2, name: 'Молоко', price: 65},
    {id: 3, name: 'Яйца', price: 50},
]

// для парсинга json из тела объектов
app.use(express.json());

// маршрут главной страницы
app.get('/', (req, res) => {
    res.send("Welcome!");
})

// получить все товары
app.get('/products', (req, res) => {
    res.send(JSON.stringify(products));
})

// получить конкретный товар
app.get('/product/:id', (req, res) => {
    const targetProduct = products.find((p) => p.id == req.params.id)
    res.send(JSON.stringify(targetProduct));
})

// создать товар
app.post('/products', (req, res) => {
    const { name, price } = req.body;
    const newProduct = {
        id: Date.now(),
        name,
        price
    }
    products.push(newProduct);
    res.status(201).send('Product added!');
})

// изменить товар
app.patch('/product/:id', (req, res) => {
    const product = products.find((p) => p.id == req.params.id);
    const {name, price} = req.body;
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    res.send('Product updated!');
})

// удалить товар
app.delete('/product/:id', (req, res) => {
    products = products.filter((p) => p.id !== req.params.id);
})

// запуск сервера
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})