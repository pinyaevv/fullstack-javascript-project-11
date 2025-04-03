import axios from 'axios';
import logger from './logger.js';

export const fetchRSS = (url) => {
  return new Promise((resolve, reject) => {
    const proxyUrl = `https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}&disableCache=true`;
    
    axios.get(proxyUrl, { timeout: 5000 })
      .then((response) => {
        if (!response.data.contents) {
          throw new Error('InvalidRSS');
        }
        resolve(response.data.contents);
      })
      .catch((error) => {
        const errorType = (error.code === 'ECONNABORTED' || 
          error.message.includes('network') || 
          error.isAxiosError) ? 'network' : 'invalidRss';

        reject(new Error(errorType));
      });
  });
};

export const parserRSS = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(data, 'application/xml');

      if (doc.querySelector('parsererror')) {
        throw new Error('InvalidRSS');
      }

      const feed = {
        title: doc.querySelector('channel > title')?.textContent || 'No title',
        description: doc.querySelector('channel > description')?.textContent || 'No description',
      };

      const posts = Array.from(doc.querySelectorAll('item')).map((item) => ({
        title: item.querySelector('title')?.textContent?.trim() || 'No title',
        link: item.querySelector('link')?.textContent?.trim() || '#',
        description: item.querySelector('description')?.textContent?.trim() || '',
      }));

      resolve({ feed, posts });
    } catch (error) {
      logger.error('Parse error:', error);
      reject(new Error(error.message === 'InvalidRSS' ? 'InvalidRSS' : 'ParseError'));
    }
  });
};
