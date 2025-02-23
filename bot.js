const sendTelegramMessage = async (message) => {
    const botToken = '8014313567:AAGYm39AA6G_nY9lR5K74Yw5oxK2uOUI6MU';// Замените на ваш токен бота
    const chatId = '2134024173'; // Замените на ваш Chat ID
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
