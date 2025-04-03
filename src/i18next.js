import i18next from 'i18next';

const createI18n = () => {
  return new Promise((resolve) => {
    i18next.init({
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
              url: 'Некорректный URL',
              invalidRss: 'Ресурс не содержит валидный RSS',
              network: 'Ошибка сети',
            },
          },
        },
      },
    }, () => {
      resolve(i18next);
    });
  });
};

export default createI18n;
