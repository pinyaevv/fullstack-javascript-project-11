import createI18n from './i18next.js';

const initApp = () => new Promise((resolve) => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    feedback: document.querySelector('.feedback'),
    feedsContainer: document.getElementById('feeds'),
    postsContainer: document.getElementById('posts'),
    modal: document.getElementById('postModal'),
  };

  const state = {
    feeds: [],
    posts: [],
    addedUrls: [],
    readPosts: new Set(),
  };

  createI18n().then((i18next) => {
    resolve({ elements, state, i18next });
  });
});

export default initApp;
