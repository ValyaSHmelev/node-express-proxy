require('dotenv').config(); // Подключаем dotenv
const express = require('express');
const proxy = require('express-http-proxy');

const app = express();
const PORT = process.env.PORT || 3000; // Порт, на котором будет работать прокси-сервер
const TARGET_URL = process.env.TARGET_URL; // Получаем целевой URL из переменной окружения

// Проверка наличия целевого URL
if (!TARGET_URL) {
    console.error('Ошибка: целевой URL не указан в .env файле');
    process.exit(1);
}

// Настройка прокси
app.use('/proxy', proxy(TARGET_URL, {
    // Опции прокси
    proxyReqPathResolver: function (req) {
        return req.originalUrl.replace('/proxy', ''); // Удаляем '/proxy' из пути
    },
}));

app.listen(PORT, () => {
    console.log(`Прокси-сервер запущен на http://localhost:${PORT}/proxy`);
});
