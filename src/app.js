import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.scss';
import { reaction } from 'mobx';
import initApp from './index.js';
import { fetchRSS, parserRSS } from './rss.js';
import createSchema from './validation.js';
import logger from './logger.js';
import createView from './view.js';
import store from './store/storeApp.js';

const normalizeUrl = (url) => url.trim().replace(/\/+$/, '').toLowerCase();

const validateUrl = (url, addedUrls, i18next) => {
  if (!url.trim()) {
    return Promise.reject(new Error(i18next.t('errors.required')));
  }

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
  initApp().then(({ elements, i18next }) => {
    const view = createView(elements, i18next, store);
    const { initFormHandler, initPreviewHandlers } = view.init();

    reaction(
      () => store.process.state,
      (state) => {
        switch (state) {
          case 'sending':
            view.showLoading();
            break;
          case 'success':
            view.showSuccess(i18next.t('rssForm.success'));
            break;
          case 'error':
            view.showError(store.process.error);
            break;
          default:
            view.clearInput();
        }
      },
    );

    const handleFormSubmit = (url) => {
      store.setLoading();

      validateUrl(url, store.addedUrls, i18next)
        .then(fetchRSS)
        .then(parserRSS)
        .then(({ feed, posts }) => {
          store.addFeed({ ...feed, url: normalizeUrl(url) });
          store.addPosts(posts);
          store.setSuccess();
          view.clearInput();
        })
        .catch((error) => {
          store.setError(getErrorMessage(error, i18next));
        });
    };

    const handlePreview = (postLink) => {
      const post = store.posts.find((p) => p.link === postLink);
      if (post) {
        store.markAsRead(postLink);
        return post;
      }
      return null;
    };

    initFormHandler(handleFormSubmit);
    initPreviewHandlers(handlePreview);
  }).catch(logger.error);
};

runApp();
