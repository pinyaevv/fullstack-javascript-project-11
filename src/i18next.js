import i18next from 'i18next'

const createI18n = () => i18next.init({
  lng: 'ru',
  debug: false,
  resources: {
    ru: {
      translation: {
        rssForm: {
          title: 'RSS Агрегатор',
          description: 'Добавьте RSS и читайте любимые новости в одном месте',
          inputPlaceholder: 'Ссылка RSS',
          submitButton: 'Добавить',
          loading: 'Загрузка RSS потока...',
          success: 'RSS успешно загружен',
        },
        ui: {
          preview: 'Просмотр',
        },
        errors: {
          required: 'Не должно быть пустым',
          notOneOf: 'RSS уже существует',
          url: 'Ссылка должна быть валидным URL',
          invalidRss: 'Ресурс не содержит валидный RSS',
          network: 'Ошибка сети',
          unknown: 'Неизвестная ошибка',
        },
      },
    },
  },
}).then(() => i18next)

export default createI18n
