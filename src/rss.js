import axios from 'axios';
import i18next from 'i18next';

export const fetchRSS = (url) => {
  console.log('Начало fetchRSS для URL:', url);
  const proxyUrl = `https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}&disableCache=true`;
  console.log('Сформированный proxy URL:', proxyUrl);

  return axios.get(proxyUrl)
    .then((response) => {
      console.log('Ответ от прокси получен', {
        status: response.status,
        dataLength: response.data.contents?.length,
      });

      if (!response.data.contents) {
        console.error('Ошибка в fetchRSS: Данные от прокси отсутствуют');
        throw new Error('Данные от прокси отсутствуют');
      }

      return response.data.contents;
    })
    .catch((error) => {
      console.error('Ошибка при запросе к прокси:', error);
      throw error;
    });
};

const cleanDescription = (html) => {
  if (!html) return '';

  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent
    .replace(/\s+/g, ' ')
    .trim();
};

export const parserRSS = (data) => {
  console.log('Начало парсинга, длина данных:', data?.length);
  return new Promise((resolve, reject) => {
    try {
      if (!data) {
        console.error('Нет данных для парсинга');
        throw new Error('Данные для парсинга отсутствуют');
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(data, 'application/xml');
      console.log('XML документ создан');

      const errorNode = doc.querySelector('parsererror');
      if (errorNode) {
        console.error('Ошибка парсинга XML:', errorNode.textContent);
        throw new Error(i18next.t('errors.invalidRss'));
      }

      const feed = {
        title: doc.querySelector('channel > title')?.textContent || 'Нет заголовка',
        description: doc.querySelector('channel > description')?.textContent || 'Нет описания',
      };
      console.log('Извлечённый фид:', feed);

      const posts = Array.from(doc.querySelectorAll('item')).map((item) => {
        const description = item.querySelector('description')?.textContent
          || item.querySelector('content\\:encoded')?.textContent
          || '';
        return {
          title: item.querySelector('title')?.textContent?.trim(),
          link: item.querySelector('link')?.textContent?.trim(),
          description: cleanDescription(description),
        };
      });
      console.log('Извлечено постов:', posts.length);

      resolve({ feed, posts });
    } catch (error) {
      console.error('Ошибка в parserRSS:', {
        error: error.message,
        stack: error.stack,
      });
      reject(error);
    }
  });
};
