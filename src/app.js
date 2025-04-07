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
    this.previousState = null;
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    if (this.previousState) {
      callback(this.previousState);
    }
  }

  notify(newState) {
    this.previousState = { ...newState };
    this.subscribers.forEach((cb) => cb(newState));
  }
}

const normalizeUrl = (url) => url.trim().replace(/\/+$/, '').toLowerCase();

const startFeedUpdates = (state, observer) => {
  const update = () => {
    const promises = state.addedUrls.map((url) => fetchRSS(url)
      .then(parserRSS)
      .then(({ posts }) => {
        const newPosts = posts.filter((post) => !state.posts.some((p) => p.link === post.link));

        if (newPosts.length) {
          state.posts.unshift(...newPosts);
          observer.notify(state);
        }
      })
      .catch((error) => {
        state.lastError = { message: 'Ошибка обновления фида', details: error };
        observer.notify(state);
      }));

    Promise.all(promises)
      .finally(() => setTimeout(update, 5000));
  };

  update();
};

const runApp = () => {
  initApp().then(({ elements, state, i18next }) => {
    const observer = new StateObserver();
    const view = createView(elements, i18next);

    observer.subscribe((currentState) => {
      elements.input.value = currentState.ui.inputValue;
      switch (currentState.process.state) {
        case 'sending':
          view.showLoading();
          break;

        case 'success':
          view.showSuccess(i18next.t('rssForm.success'));
          setTimeout(() => {
            state.process.state = 'ready';
            observer.notify(state);
          }, 3000);
          break;

        case 'error':
          view.showError(currentState.process.error);
          break;

        case 'ready':
        default:
          view.clearInput();
          elements.feedback.className = 'feedback';
          break;
      }
      view.renderFeeds(currentState.feeds);
      view.renderPosts(currentState.posts, currentState.readPosts);

      if (currentState.lastError) {
        view.showError(currentState.lastError.message);
      }
    });

    const handleFormSubmit = (url) => {
      state.ui.inputValue = url;
      state.process.state = 'sending';
      state.process.error = null;
      observer.notify(state);

      const normalizedUrl = normalizeUrl(url);
      const currentSchema = createSchema(i18next, state.addedUrls.map(normalizeUrl));

      currentSchema.validate({ url: normalizedUrl }, { abortEarly: false })
        .then(() => fetchRSS(url))
        .then(parserRSS)
        .then(({ feed, posts }) => {
          state.addedUrls.push(url);
          state.feeds.unshift({ ...feed, url });
          state.posts.unshift(...posts);

          state.ui.inputValue = '';
          observer.notify(state);

          view.showSuccess(i18next.t('rssForm.success'));

          startFeedUpdates(state, observer);
        })
        .catch((error) => {
          state.process.state = 'error';
          state.process.error = view.showError(error);
          let errorMessage;

          if (error.name === 'ValidationError') {
            const [firstError] = error.errors;
            errorMessage = firstError;
          } else if (error.message === 'InvalidRSS') {
            errorMessage = i18next.t('errors.invalidRss');
          } else if (error.message.includes('network')) {
            errorMessage = i18next.t('errors.network');
          } else {
            errorMessage = error.message;
          }

          logger.error('Form error:', error);
          state.lastError = {
            message: errorMessage,
          };

          observer.notify(state);
        });
    };

    const handlePreview = (postLink) => {
      state.readPosts.add(postLink);
      observer.notify(state);

      const post = state.posts.find((p) => p.link === postLink);
      if (post) {
        view.showPostModal(post.title, post.description);
      }
    };

    view.initFormHandler(handleFormSubmit);
    view.initPreviewHandlers(handlePreview);
    observer.notify(state);
  }).catch(logger.error);
};

runApp();
