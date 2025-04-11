import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.scss';
import initApp from './index.js';
import { fetchRSS, parserRSS } from './rss.js';
import createSchema from './validation.js';
import logger from './logger.js';
import createView from './view.js';

class StateObserver {
  constructor() {
    this.subscribers = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
  }

  notify(newState) {
    this.subscribers.forEach((cb) => cb(newState));
  }
}

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
    const observer = new StateObserver();
    const view = createView(elements, i18next, observer);
    const { initFormHandler, initPreviewHandlers } = view.initialization();

    let appState = { ...state };

    const handleFormSubmit = (url) => {
      observer.notify({
        ...appState,
        process: { state: 'sending', error: null },
      });

      validateUrl(url, appState.addedUrls, i18next)
        .then(fetchRSS)
        .then(parserRSS)
        .then(({ feed, posts }) => {
          appState = {
            ...appState,
            addedUrls: [...appState.addedUrls, normalizeUrl(url)],
            feeds: [{ ...feed, url }, ...appState.feeds],
            posts: [...posts, ...appState.posts],
            process: { state: 'success' },
          };
          observer.notify(appState);
        })
        .catch((error) => {
          const errorMessage = getErrorMessage(error, i18next);
          appState = {
            ...appState,
            process: { state: 'error', error: errorMessage },
          };
          observer.notify(appState);
        });
    };

    const handlePreview = (postLink) => {
      const post = appState.posts.find((p) => p.link === postLink);
      if (post) {
        appState = {
          ...appState,
          readPosts: new Set([...appState.readPosts, postLink]),
        };
        observer.notify(appState);
      }
      return post;
    };

    initFormHandler(handleFormSubmit);
    initPreviewHandlers(handlePreview);
    observer.notify(appState);
  }).catch(logger.error);
};

runApp();
