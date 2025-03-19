import  './styles.scss';
import  'bootstrap';
import schema from './validation.js';
import View from './view.js';
import i18next from './i18next.js';
import { fetchRSS, parserRSS } from './rss.js';

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

const view = new View(form, input, feedback, feedsContainer, postsContainer);

form.addEventListener('submit', (event) => {
    event.preventDefault();
  
    const formData = new FormData(event.target);
    const url = formData.get('url');
  
    if (!url) {
      view.setError(i18next.t('errors.required'));
      return;
    }
  
    const trimmedUrl = url.trim();
  
    if (!trimmedUrl) {
      view.setError(i18next.t('errors.required'));
      return;
    }
  
    schema.validate({ url: trimmedUrl }, { abortEarly: false })
      .then(() => fetchRSS(trimmedUrl))
      .then((data) => parserRSS(data))
      .then(({ feed, posts }) => {
        console.log('Feed:', feed);
        console.log('Posts:', posts);
        view.addFeed(feed);
        posts.forEach(post => view.addPost(post));
        view.clearForm();
      })
      .catch((error) => {
        if(error.name === 'ValidationError') {
          view.setError(error.errors[0]);
        } else {
          view.setError(i18next.t('errors.network'));
          console.error(error);
        }
      });
});
