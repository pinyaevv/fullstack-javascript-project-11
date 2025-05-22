import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.scss'
import * as yup from 'yup'
import initApp from './init.js'
import { fetchRSS, parserRSS } from './rss.js'
import logger from './logger.js'
import createView from './view.js'
import store from './store/storeApp.js'
import getErrorMessage from './errors/errorMessages.js'
import initFormStateWatcher from './watchers/appWatchers.js'
import initViewWatchers from './watchers/viewWatchers.js'

const normalizeUrl = url => url.trim().replace(/\/+$/, '').toLowerCase()

const validateUrl = (url, addedUrls, i18next) => {
  const normalizedUrl = normalizeUrl(url)

  const schema = yup.string()
    .required(i18next.t('errors.required'))
    .url(i18next.t('errors.url'))
    .notOneOf(addedUrls.map(u => normalizeUrl(u)), i18next.t('errors.notOneOf'))

  return schema
    .validate(normalizedUrl)
    .then(() => normalizedUrl)
    .catch((error) => {
      const err = new Error(error.message)
      err.name = 'ValidationError'
      return Promise.reject(error)
    })
}

const runApp = () => {
  initApp().then(({ elements, i18next }) => {
    const view = createView(elements, i18next, store)
    const { initFormHandler, initPreviewHandlers } = view

    initFormStateWatcher(store, view, i18next)
    initViewWatchers(store, elements, i18next)

    const handleFormSubmit = (url) => {
      store.setLoading()

      validateUrl(url, store.addedUrls, i18next)
        .then(fetchRSS)
        .then((data) => {
          const { feed, posts } = parserRSS(data)
          store.addFeed({ ...feed, url: normalizeUrl(url) })
          store.addPosts(posts)
          store.setSuccess()
          view.clearInput()
        })
        .catch((error) => {
          store.setError(getErrorMessage(error, i18next))
        })
    }

    const handlePreview = (postLink) => {
      const post = store.posts.find(p => p.link === postLink)
      if (post) {
        store.markAsRead(postLink)
        store.setPreviewPost(post)
      }
    }

    initFormHandler(handleFormSubmit)
    initPreviewHandlers(handlePreview)
  }).catch((error) => {
    logger.error('Ошибка инициализации приложения:', error.message || error)
  })
}

runApp()
