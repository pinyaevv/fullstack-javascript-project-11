import i18next from 'i18next';

console.log('Иницилизация i18next');
i18next.init({
  lng: 'ru',
  debug: true,
  resources: {
    ru: {
      translation: {
        rssForm: {
          title: 'RSS агрегатор',
          description: 'Добавьте RSS и читайте любимые новости в одном месте',
          inputPlaceholder: 'Ссылка RSS',
          submitButton: 'Добавить',
          success: 'RSS успешно загружен',
        },
        errors: {
          required: 'Поле не может быть пустым',
          url: 'Ссылка должна быть валидным URL',
          notOneOf: 'RSS уже существует',
          network: 'Ошибка сети',
          invalidRss: 'Ресурс не содержит валидный RSS',
          unknown: 'Неизвестная ошибка',
        },
        buttons: {
          preview: 'Просмотр',
        }
      },
    },
  },
});
console.log('i18next инициализорован со следующей локалью:', i18next.language);

export default i18next;
