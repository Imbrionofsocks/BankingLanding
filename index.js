const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

const PORT = 3000;

const getMimeType = (ext) => {
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.json': 'application/json',
        '.ico': 'image/x-icon',
    };
    return mimeTypes[ext] || 'application/octet-stream';
};


const sendTelegramMessage = async (message) => {
    const botToken = '8014313567:AAGYm39AA6G_nY9lR5K74Yw5oxK2uOUI6MU'; // Замените на ваш токен бота
    const chatId = '2134024173'; // Замените на ваш chat ID
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
        }),
    });

    if (!response.ok) {
        throw new Error('Ошибка при отправке сообщения в Telegram');
    }

    const data = await response.json();
    return data;
};

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/send_email') {
        const form = new formidable.IncomingForm();

        form.parse(req, async (err, fields) => {
            if (err) {
                console.error('Ошибка при парсинге формы:', err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Ошибка при парсинге формы');
                return;
            }
            const name = fields.name;
            const phone = fields.phone;
            const debt = fields.debt;
            const mortgage = fields.mortgage;
            const region = fields.region; 

            console.log('Имя:', name, 'Телефон:', phone, 'Сумма долга:', debt, 'Есть ли просрочки:', mortgage, 'Регион:', region);

            const message = `Новая консультация:\nИмя: ${name}\nТелефон: ${phone}\nСумма долга: ${debt}\nЕсть ли просрочки: ${mortgage}\nРегион: ${region}`;

            try {
                await sendTelegramMessage(message);
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Сообщение успешно отправлено в Telegram!');
            } catch (error) {
                console.error('Ошибка при отправке сообщения:', error);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Ошибка при отправке сообщения в Telegram');
            }
        });

        return;
    }

    const sanitizedPath = decodeURIComponent(req.url.split('?')[0]);
    const filePath = path.join(__dirname, sanitizedPath === '/' ? 'index.html' : sanitizedPath);

    const ext = path.extname(filePath);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {

            if (!ext) {
                const indexPath = path.join(__dirname, 'index.html');
                fs.readFile(indexPath, (err, data) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Ошибка на сервере');
                        return;
                    }

                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(data);
                });
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Файл не найден');
            }
            return;
        }

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Ошибка на сервере');
                return;
            }

            res.writeHead(200, { 'Content-Type': getMimeType(ext) });
            res.end(data);
        });
    });
});
server.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});
