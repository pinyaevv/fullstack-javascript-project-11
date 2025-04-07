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
        const newPosts = posts
          .filter((post) => !currentState.posts.some((p) => p.link === post.link));

        if (newPosts.length) {
          const updatedState = {
            ...currentState,
            posts: [...newPosts, ...currentState.posts],
          };
          observer.notify(updatedState);
        }
      })
      .catch((error) => {
        const updatedState = {
          ...currentState,
          lastError: { message: 'Ошибка обновления фида', details: error },
        };
        observer.notify(updatedState);
      }));

    Promise.all(promises)
      .finally(() => setTimeout(update, 5000));
  };

  update();
};

const runApp = () => {
  initApp().then(({ elements: initialElements, state, i18next }) => {
    const observer = new StateObserver();
    const view = createView(initialElements, i18next);
    let appState = { ...state };
    let elements = { ...initialElements };

    observer.subscribe((currentState) => {
      appState = currentState;
      // Создаем новый объект elements вместо изменения параметра
      elements = {
        ...elements,
        input: {
          ...elements.input,
          value: currentState.ui.inputValue,
        },
      };

      switch (currentState.process.state) {
        case 'sending':
          view.showLoading();
          break;
        case 'success':
          view.showSuccess(i18next.t('rssForm.success'));
          setTimeout(() => {
            const updatedState = {
              ...appState,
              process: {
                ...appState.process,
                state: 'ready',
              },
            };
            observer.notify(updatedState);
          }, 3000);
          break;
        case 'error':
          view.showError(currentState.process.error);
          break;
        case 'ready':
        default:
          view.clearInput();
          // Создаем новый объект вместо изменения параметра
          elements = {
            ...elements,
            feedback: {
              ...elements.feedback,
              className: 'feedback',
            },
          };
          break;
      }

      view.renderFeeds(currentState.feeds);
      view.renderPosts(currentState.posts, currentState.readPosts);

      if (currentState.lastError) {
        view.showError(currentState.lastError.message);
      }
    });

    const handleFormSubmit = (url) => {
      const updatedState = {
        ...appState,
        ui: {
          ...appState.ui,
          inputValue: url,
        },
        process: {
          ...appState.process,
          state: 'sending',
          error: null,
        },
        lastError: null,
      };
      observer.notify(updatedState);

      const normalizedUrl = normalizeUrl(url);
      const currentSchema = createSchema(i18next, appState.addedUrls.map(normalizeUrl));

      currentSchema.validate({ url: normalizedUrl }, { abortEarly: false })
        .then(() => fetchRSS(url))
        .then(parserRSS)
        .then(({ feed, posts }) => {
          const successState = {
            ...appState,
            addedUrls: [...appState.addedUrls, url],
            feeds: [{ ...feed, url }, ...appState.feeds],
            posts: [...posts, ...appState.posts],
            ui: {
              ...appState.ui,
              inputValue: '',
            },
            process: {
              ...appState.process,
              state: 'success',
            },
          };
          observer.notify(successState);
          startFeedUpdates(successState, observer);
        })
        .catch((error) => {
          let errorMessage;
          if (error.name === 'ValidationError') {
            [errorMessage] = error.errors;
          } else if (error.message === 'InvalidRSS') {
            errorMessage = i18next.t('errors.invalidRss');
          } else if (error.message.includes('network')) {
            errorMessage = i18next.t('errors.network');
          } else {
            errorMessage = error.message;
          }

          const errorState = {
            ...appState,
            process: {
              ...appState.process,
              state: 'error',
              error: errorMessage,
            },
            lastError: {
              message: errorMessage,
            },
          };
          observer.notify(errorState);
          logger.error('Form error:', error);
        });
    };

    const handlePreview = (postLink) => {
      const updatedState = {
        ...appState,
        readPosts: new Set([...appState.readPosts, postLink]),
      };
      observer.notify(updatedState);

      const post = appState.posts.find((p) => p.link === postLink);
      if (post) {
        view.showPostModal(post.title, post.description);
      }
    };

    view.initFormHandler(handleFormSubmit);
    view.initPreviewHandlers(handlePreview);
    observer.notify(appState);
  }).catch(logger.error);
};

runApp();
