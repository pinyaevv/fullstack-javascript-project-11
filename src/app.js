import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.scss';
import initApp from './index.js';
import View from './view.js';
import { fetchRSS, parserRSS } from './rss.js';
import createSchema from './validation.js';
import logger from './logger.js';

const startFeedUpdates = (state, view) => {
  const update = () => {
    const promises = state.addedUrls.map((url) => fetchRSS(url)
      .then(parserRSS)
      .then(({ posts }) => {
        const newPosts = posts.filter((post) => !state.posts.some((p) => p.link === post.link));
        if (newPosts.length) {
          state.posts.unshift(...newPosts);
          view.renderPosts(state.posts, state.readPosts);
        }
      })
      .catch(logger.error));

    Promise.all(promises)
      .finally(() => setTimeout(update, 5000));
  };

  update();
};

const runApp = () => {
  initApp().then(({ elements, state, i18next }) => {
    const view = new View(elements, i18next);
    const normalizeUrl = (url) => url.trim().replace(/\/+$/, '').toLowerCase();

    const handleFormSubmit = (url) => {
      const normalizedUrl = normalizeUrl(url);
      const currentSchema = createSchema(i18next, state.addedUrls.map(normalizeUrl));

      currentSchema.validate({ url: normalizedUrl }, { abortEarly: false })
        .then(() => fetchRSS(url))
        .then(parserRSS)
        .then(({ feed, posts }) => {
          state.addedUrls.push(url);
          state.feeds.unshift({ ...feed, url });
          state.posts.unshift(...posts);

          view.renderFeeds(state.feeds);
          view.renderPosts(state.posts, state.readPosts);
          view.showSuccess(i18next.t('rssForm.success'));
          view.clearInput();

          startFeedUpdates(state, view);
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
          view.showError(errorMessage);
        });
    };

    const handlePreview = (postLink) => {
      state.readPosts.add(postLink);
      const post = state.posts.find((p) => p.link === postLink);
      if (post) {
        view.showPostModal(post.title, post.description);
        view.renderPosts(state.posts, state.readPosts);
      }
    };

    view.initFormHandler(handleFormSubmit);
    view.initPreviewHandlers(handlePreview);
  }).catch(logger.error);
};

runApp();
