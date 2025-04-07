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

const startFeedUpdates = (currentState, observer) => {
  const update = () => {
    const promises = currentState.addedUrls.map((url) => fetchRSS(url)
      .then(parserRSS)
      .then(({ posts }) => {
        const newPosts = posts.filter((post) => !currentState.posts
          .some((p) => p.link === post.link));

        if (newPosts.length) {
          const updatedState = {
            ...currentState,
            posts: [...newPosts, ...currentState.posts],
            lastError: null,
          };
          observer.notify(updatedState);
        }
      })
      .catch((error) => {
        const errorState = {
          ...currentState,
          lastError: { message: 'Ошибка обновления фида', details: error },
        };
        observer.notify(errorState);
      }));

    Promise.all(promises)
      .finally(() => setTimeout(update, 5000));
  };

  update();
};

const runApp = () => {
  initApp().then(({ elements, initialState, i18next }) => {
    const observer = new StateObserver();
    const view = createView(elements, i18next);

    observer.subscribe((currentState) => {
      const newElements = { ...elements };
      newElements.input.value = currentState.ui.inputValue || '';

      switch (currentState.process.state) {
        case 'sending':
          view.showLoading();
          break;
        case 'success':
          view.showSuccess(i18next.t('rssForm.success'));
          setTimeout(() => {
            const readyState = {
              ...currentState,
              process: { state: 'ready', error: null },
            };
            observer.notify(readyState);
          }, 3000);
          break;
        case 'error':
          view.showError(currentState.process.error);
          break;
        default:
          view.clearInput();
          newElements.feedback.className = 'feedback';
      }

      view.renderFeeds(currentState.feeds);
      view.renderPosts(currentState.posts, currentState.readPosts);
    });

    const handleFormSubmit = (url) => {
      const sendingState = {
        ...initialState,
        ui: { inputValue: url },
        process: { state: 'sending', error: null },
      };
      observer.notify(sendingState);

      const normalizedUrl = normalizeUrl(url);
      const currentSchema = createSchema(i18next, initialState.addedUrls.map(normalizeUrl));

      currentSchema.validate({ url: normalizedUrl }, { abortEarly: false })
        .then(() => fetchRSS(url))
        .then(parserRSS)
        .then(({ feed, posts }) => {
          const successState = {
            ...sendingState,
            addedUrls: [...sendingState.addedUrls, url],
            feeds: [{ ...feed, url }, ...sendingState.feeds],
            posts: [...posts, ...sendingState.posts],
            ui: { inputValue: '' },
            process: { state: 'success', error: null },
          };
          observer.notify(successState);
          startFeedUpdates(successState, observer);
        })
        .catch((error) => {
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
          const errorState = {
            ...sendingState,
            process: { state: 'error', error: errorMessage },
            lastError: { message: errorMessage },
          };
          observer.notify(errorState);
        });
    };

    const handlePreview = (postLink) => {
      const updatedState = {
        ...initialState,
        readPosts: new Set([...initialState.readPosts, postLink]),
      };
      observer.notify(updatedState);

      const post = initialState.posts.find((p) => p.link === postLink);
      if (post) {
        view.showPostModal(post.title, post.description);
      }
    };

    view.initFormHandler(handleFormSubmit);
    view.initPreviewHandlers(handlePreview);
    observer.notify(initialState);
  }).catch(logger.error);
};

runApp();
