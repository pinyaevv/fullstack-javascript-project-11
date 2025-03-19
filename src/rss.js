import axios from 'axios';

export const fetchRSS = (url) => {
    const proxyUrl = `https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}&disableCache=true`;
    return axios.get(proxyUrl)
      .then((response) => response.data.contents);
};

export const parserRSS = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'application/xml');

            const errorNode = doc.querySelector('parsererror');
            if (errorNode) {
                throw new Error('Ошибка парсинга RSS');
            }

            const feed = {
                title: doc.querySelector('channel > title')?.textContent || 'Нет заголовка',
                description: doc.querySelector('channel > description')?.textContent || 'Нет описания',
            };

            const posts = Array.from(doc.querySelectorAll('item')).map((item) => ({
                title: item.querySelector('title')?.textContent || 'Нет заголовка',
                link: item.querySelector('link')?.textContent || '#',
            }));

            resolve({ feed, posts });
        } catch (error) {
            reject(new Error('Ошибка парсинга RSS'));
        }
    });
};
