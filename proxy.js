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

const fetch = require('node-fetch')
const handleError = (res, error) => {
    console.log(error);
    res.status(500).send(error.message)
}
function sleep(ms, msg) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchRetry(url, delay, tries, fetchOptions = {}) {
    function onError(err) {
        triesLeft = tries - 1;
        if (!triesLeft) {
            throw err;
        }
        const nextDelay = delay * 2; // Удваиваем задержку после каждой неудачной попытки
        return sleep(nextDelay).then(() => fetchRetry(url, nextDelay, triesLeft, fetchOptions));
    }
    return fetch(url, fetchOptions).catch(onError);
}

const router = express.Router()

router.get('/fundmetrology/cm/iaux/vri/:globalId', async (req, res) => {
    try {
        let response = await fetchRetry('https://fgis.gost.ru/fundmetrology/cm/iaux/vri/1-' + req.params.globalId, 1000, 5)
        response = await response.json()
        res.status(200).json(response)
    } catch (error) {
        handleError(res, error)
    }
})

// Настройка прокси
app.use('/proxy', proxy(TARGET_URL, {
    // Опции прокси
    // proxyReqPathResolver: function (req) {
    //     return req.originalUrl.replace('/proxy', ''); // Удаляем '/proxy' из пути
    // },
}));

app.use(router)

app.listen(PORT, () => {
    console.log(`Прокси-сервер запущен на http://localhost:${PORT}/proxy`);
});
