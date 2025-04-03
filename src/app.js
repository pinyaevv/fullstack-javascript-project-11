import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.scss';
import { initApp } from './index.js';
import View from './view.js';
import { fetchRSS, parserRSS } from './rss.js';
import createSchema from './validation.js';
import logger from './logger.js';

const runApp = () => {
  initApp().then(({ elements, state, i18next }) => {
    const view = new View(elements, i18next);
    const schema = createSchema(i18next);

    const handleFormSubmit = (url) => {
      schema.validate({ url })
        .then(() => {
          if (state.addedUrls.includes(url)) {
            throw new Error(i18next.t('errors.notOneOf'));
          }
          return fetchRSS(url);
        })
        .then(parserRSS)
        .then(({ feed, posts }) => {
          state.feeds.unshift({ ...feed, url });
          state.posts.unshift(...posts);
          state.addedUrls.push(url);
          
          view.renderFeeds(state.feeds);
          view.renderPosts(state.posts, state.readPosts);
          view.showSuccess(i18next.t('rssForm.success'));
          
          startFeedUpdates(state, view, i18next);
        })
        .catch((error) => {
          let errorMessage;

          if (error.message === 'InvalidRSS') {
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
      const post = state.posts.find(p => p.link === postLink);
      if (post) {
        view.showPostModal(post.title, post.description);
        view.renderPosts(state.posts, state.readPosts);
      }
    };

    view.initFormHandler(handleFormSubmit);
    view.initPreviewHandlers(handlePreview);
  }).catch(logger.error);
};

const startFeedUpdates = (state, view) => {
  const update = () => {
    const promises = state.addedUrls.map(url => 
      fetchRSS(url)
        .then(parserRSS)
        .then(({ posts }) => {
          const newPosts = posts.filter(
            post => !state.posts.some(p => p.link === post.link),
          );
          if (newPosts.length) {
            state.posts.unshift(...newPosts);
            view.renderPosts(state.posts, state.readPosts);
          }
        })
        .catch(logger.error),
    );

    Promise.all(promises)
      .finally(() => {
        setTimeout(update, 5000);
      });
  };
  
  update();
};

runApp();
