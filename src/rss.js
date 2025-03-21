import axios from 'axios';

export const fetchRSS = (url) => {
    const proxyUrl = `https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}&disableCache=true`;
    return axios.get(proxyUrl)
      .then((response) => {
        console.log('Ответ от прокси:', response); 
        console.log('Данные от прокси:', response.data.contents);
  
        if (!response.data.contents) {
          throw new Error('Данные от прокси отсутствуют');
        }
  
        return response.data.contents;
      })
      .catch((error) => {
        console.error('Ошибка при запросе к прокси:', error);
        throw error;
      });
  };

export const parserRSS = (data) => {
    return new Promise((resolve, reject) => {
      try {
        console.log('Данные для парсинга:', data);

        if (!data) {
          throw new Error('Данные для парсинга отсутствуют');
        }
  
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'application/xml');
  
        const errorNode = doc.querySelector('parsererror');
        if (errorNode) {
          console.error('Ошибка парсинга XML:', errorNode.textContent);
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
  
        console.log('Результат парсинга:', { feed, posts });
        resolve({ feed, posts });
      } catch (error) {
        console.error('Ошибка в parserRSS:', error);
        reject(new Error('Ошибка парсинга RSS'));
      }
    });
};
