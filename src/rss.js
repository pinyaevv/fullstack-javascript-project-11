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
            const document = parser.parseFromString(data, 'application/xml');

            const feeds = {
                title: document.querySelector('channel > title').textContent,
                description: document.querySelector('channel > description').textContent,
            }

            const posts = Array.from(document.querySelector('item')).map((item) => ({
                title: item.querySelector('title').textContent,
                lint: item.querySelector('link').textContent,
            }));

            resolve({ feeds, posts });
        } catch (error) {
            reject(new Error('Ошибка парсинга RSS'));
        }
    });
};
