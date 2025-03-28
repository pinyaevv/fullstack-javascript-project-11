import './styles.scss';
import { createSchema } from './validation.js';
import View from './view.js';
import i18next from './i18next.js';
import { fetchRSS, parserRSS } from './rss.js';
import * as yup from 'yup';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const form = document.querySelector('.rss-form');
const input = document.getElementById('url-input');
const feedback = document.querySelector('.feedback');
const feedsContainer = document.getElementById('feeds');
const postsContainer = document.getElementById('posts');
const title = document.getElementById('title');
const description = document.getElementById('description');
const inputLabel = document.getElementById('input-label');
const submitButton = document.getElementById('submit-button');

title.textContent = i18next.t('rssForm.title');
description.textContent = i18next.t('rssForm.description');
inputLabel.textContent = i18next.t('rssForm.inputPlaceholder');
submitButton.textContent = i18next.t('rssForm.submitButton');

const state = {
  form: {
    valid: true,
    error: null,
    url: '',
  },
  feeds: [],
  posts: [],
  readPosts: new Set(),
  addedUrls: [],
};

const view = new View(form, input, feedback, feedsContainer, postsContainer, state);

const schema = createSchema(view);

console.log('Запуск приложения');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  console.log('Форма отправлена. Начало обработки...');

  const formData = new FormData(event.target);
  const url = formData.get('url');
  console.log('Введенный url:', url);

  if (!url) {
    console.warn('Пустой URL');
    view.setError(i18next.t('errors.required'));
    return;
  }

  if (view.state.form) {
    view.state.form.valid = true;
    view.state.form.error = null;
  }

  const trimmedUrl = url.trim();

  schema.validate({ url: trimmedUrl }, { abortEarly: false })
    .then(() => {
      console.log('Валидация URL прошла успешно');
      if (view.hasUrl(trimmedUrl)) {
        throw new yup.ValidationError(
          i18next.t('errors.notOneOf'),
          null,
          'notOneOf',
        );
      }
      return fetchRSS(trimmedUrl);
    })
    .then((data) => {
      console.log('Данные RSS получены');
      return parserRSS(data);
    })
    .then(({ feed, posts }) => {
      console.log('Парсинг прошел успешно:', { feed, posts });
      view.addUrl(trimmedUrl);
      view.addFeed({ ...feed, url: trimmedUrl });
      view.addPost(posts);
      view.clearForm();
      console.log('Добавлено фидов:', state.feeds.length, 'постов:', state.posts.length);
      view.showSuccess(i18next.t('rssForm.success'));

      checkForRss(state, view);
    })
    .catch((error) => {
      console.error('Ошибка в цепочке обработки RSS:', error);
      if (error.name === 'ValidationError') {
        console.warn('Ошибка валидации:', error.errors);
        view.setError(error.errors[0]);
      } else if (error.name === 'AxiosError' || error.message.includes('network')) {
        view.setError(i18next.t('errors.network'));
      } else {
        view.setError(i18next.t('errors.invalidRss'));
      }
    });
});

const checkForRss = (state, view) => {
  console.log('Проверка обновлений RSS...');
  const { feeds, posts } = state;
  console.log('Текущее количество фидов и постов:', feeds.length, posts.length);

  const promises = feeds.map((feed) => {
    console.log('Проверка фида:', feed.url);
    if (!feed.url) {
      console.error('URL не определен для RSS-потока:', feed);
      return Promise.resolve();
    }

    return fetchRSS(feed.url)
      .then((data) => parserRSS(data))
      .then(({ posts: newPosts }) => {
        console.log('Найдено новых постов:', newPosts.length);
        const uniquePosts = newPosts.filter(
          (newPost) => !posts.find((post) => post.link === newPost.link),
        );

        if (uniquePosts.length > 0) {
          console.log('Добавление новых постов:', uniquePosts.length);
          view.addPost(uniquePosts);
        }
      })
      .catch((error) => {
        console.error('Ошибка при проверке обновления:', feed.url, error);
        if (error.name === 'AxiosError' || error.message.includes('network')) {
          view.setError(i18next.t('errors.network'));
        }
      });
  });

  Promise.all(promises)
    .finally(() => {
      console.log('Проверка обновлений завершена, следующая через 5 сек');
      setTimeout(() => checkForRss(state, view), 5000);
    });
};
