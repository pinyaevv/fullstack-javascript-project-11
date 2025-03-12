import  './styles.scss';
import  'bootstrap';
import schema from './validation.js';
import View from './view.js';

const form = document.querySelector('.rss-form');
const input = document.getElementById('url-input');
const feedback = document.querySelector('.feedback');

const view = new View(form, input, feedback);

const addedFeeds = [];

form.addEventListener('submit', (event) => {
    event.preventDefault();
  
    const formData = new FormData(event.target);
    const url = formData.get('url');
  
    if (!url) {
      view.setError('Поле не может быть пустым');
      return;
    }
  
    const trimmedUrl = url.trim();
  
    if (!trimmedUrl) {
      view.setError('Поле не может быть пустым');
      return;
    }
  
    Promise.resolve()
      .then(() => schema.validate({ url: trimmedUrl }, { abortEarly: false }))
      .then(() => {
        if (addedFeeds.includes(trimmedUrl)) {
            throw new yup.ValidationError('RSS-поток уже добавлен', null, 'url');
          }
        addedFeeds.push(trimmedUrl);
        view.clearForm();
        console.log('RSS-поток добавлен:', trimmedUrl);
      })
      .catch((error) => {
        if (error.name === 'ValidationError') {
          view.setError(error.errors[0]);
        } else {
          view.setError('Произошла ошибка при добавлении RSS-потока');
          console.error(error);
        }
    });
});
