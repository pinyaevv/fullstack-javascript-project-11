import createI18n from './i18next.js'

const initApp = () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    feedback: document.querySelector('.feedback'),
    feedsContainer: document.getElementById('feeds'),
    postsContainer: document.getElementById('posts'),
    modal: document.getElementById('postModal'),
  }

  return createI18n().then(i18next => ({ elements, i18next }))
}

export default initApp
