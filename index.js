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
        '.pdf': 'application/pdf',
    };
    return mimeTypes[ext] || 'application/octet-stream';
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

            const chatIds = ['2134024173', '1683610381', '6612852848'];

            try {
                await sendTelegramMessage(message, chatIds);
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
