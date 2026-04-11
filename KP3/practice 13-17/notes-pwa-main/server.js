const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// VAPID ключи
const vapidKeys = {
    publicKey: 'BOBl89kJPvriTplF9jkac6ygNOjv5Ti0YTJs9XJ23vB9BXquh1BOcnUrTaRB3HkY-JfjPvaNG-XyQVoAq-7xw1U',
    privateKey: 'Lj3Y4La1Nd_o98m1IGC-Q-i4kbU8seyaDgSelitrHlU'
};

webpush.setVapidDetails(
    'mailto:timurgd05@gmail.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './')));

// Хранилище подписок
let subscriptions = [];

// Хранилище активных напоминаний
const reminders = new Map();

const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
    console.log('Клиент подключён:', socket.id);
    
    // Обычная задача (без напоминания)
    socket.on('newTask', (task) => {
        io.emit('taskAdded', task);
    });

    // Задача с напоминанием
    socket.on('newReminder', (reminder) => {
        const { id, text, reminderTime } = reminder;
        const delay = reminderTime - Date.now();
        
        if (delay <= 0) {
            console.log('Время напоминания уже прошло');
            return;
        }

        console.log(`Напоминание #${id} запланировано через ${delay} мс`);

        // Сохраняем таймер
        const timeoutId = setTimeout(() => {
            const payload = JSON.stringify({
                title: '⏰ Напоминание',
                body: text,
                reminderId: id
            });

            subscriptions.forEach(sub => {
                webpush.sendNotification(sub, payload)
                    .then(() => console.log('Push отправлен'))
                    .catch(err => console.error('Push error:', err.message));
            });

            // Удаляем напоминание после отправки
            reminders.delete(id);
            console.log(`Напоминание #${id} отправлено`);
        }, delay);

        reminders.set(id, { timeoutId, text, reminderTime });
    });

    socket.on('disconnect', () => {
        console.log('Клиент отключён:', socket.id);
    });
});

// Эндпоинты для управления push-подписками
app.post('/subscribe', (req, res) => {
    const exists = subscriptions.some(sub => sub.endpoint === req.body.endpoint);
    if (!exists) {
        subscriptions.push(req.body);
        console.log('Новая подписка. Всего:', subscriptions.length);
    }
    res.status(201).json({ message: 'Подписка сохранена' });
});

app.post('/unsubscribe', (req, res) => {
    const { endpoint } = req.body;
    subscriptions = subscriptions.filter(sub => sub.endpoint !== endpoint);
    res.status(200).json({ message: 'Подписка удалена' });
});

// Эндпоинт для откладывания напоминания
app.post('/snooze', (req, res) => {
    const reminderId = parseInt(req.query.reminderId, 10);
    
    if (!reminderId || !reminders.has(reminderId)) {
        return res.status(404).json({ error: 'Reminder not found' });
    }

    const reminder = reminders.get(reminderId);
    clearTimeout(reminder.timeoutId);

    // Откладываем на 5 минут (300 000 мс)
    const newDelay = 5 * 60 * 1000;
    const newTimeoutId = setTimeout(() => {
        const payload = JSON.stringify({
            title: '⏰ Напоминание (отложенное)',
            body: reminder.text,
            reminderId: reminderId
        });

        subscriptions.forEach(sub => {
            webpush.sendNotification(sub, payload)
                .catch(err => console.error('Push error:', err.message));
        });

        reminders.delete(reminderId);
    }, newDelay);

    reminders.set(reminderId, {
        timeoutId: newTimeoutId,
        text: reminder.text,
        reminderTime: Date.now() + newDelay
    });

    console.log(`Напоминание #${reminderId} отложено на 5 минут`);
    res.status(200).json({ message: 'Reminder snoozed for 5 minutes' });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});