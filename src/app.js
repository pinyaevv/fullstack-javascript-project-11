import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.scss';
import createStore from './store/storeApp.js';
import initApp from './index.js';
import { fetchRSS, parserRSS } from './rss.js';
import createSchema from './validation.js';
import logger from './logger.js';
import createView from './view.js';

const normalizeUrl = (url) => url.trim().replace(/\/+$/, '').toLowerCase();

const validateUrl = (url, addedUrls, i18next) => {
  if (!url.trim()) return Promise.reject(new Error(i18next.t('errors.required')));

  return createSchema(i18next, addedUrls.map(normalizeUrl))
    .validate({ url: normalizeUrl(url) }, { abortEarly: false })
    .then(() => normalizeUrl(url));
};

const getErrorMessage = (error, i18n) => {
  if (error.name === 'ValidationError') return error.errors[0];
  if (error.message === 'InvalidRSS') return i18n.t('errors.invalidRss');
  if (error.message.includes('network')) return i18n.t('errors.network');
  return error.message || i18n.t('errors.unknown');
};

const runApp = () => {
  initApp().then(({ elements, state, i18next }) => {
    const store = createStore(state);
    const view = createView(elements, i18next, store);
    const { initFormHandler, initPreviewHandlers } = view.initialization();

    const appState = { ...state };

    const handleFormSubmit = (url) => {
      store.update({
        process: { state: 'sending', error: null },
      });

      validateUrl(url, store.state.addedUrls, i18next)
        .then(fetchRSS)
        .then(parserRSS)
        .then(({ feed, posts }) => {
          store.update((prev) => ({
            addedUrls: [...prev.addedUrls, normalizeUrl(url)],
            feeds: [{ ...feed, url }, ...prev.feeds],
            posts: [...posts, ...prev.posts],
            process: { state: 'success' },
          }));
        })
        .catch((error) => {
          store.update({
            process: {
              state: 'error',
              error: getErrorMessage(error, i18next),
            },
          });
        });
    };

    const handlePreview = (postLink) => {
      const post = store.state.posts.find((p) => p.link === postLink);
      if (post) {
        store.update({
          readPosts: new Set([...store.state.readPosts, postLink]),
        });
      }
      return post;
    };

    initFormHandler(handleFormSubmit);
    initPreviewHandlers(handlePreview);
    store.notify(appState);
  }).catch(logger.error);
};

runApp();
