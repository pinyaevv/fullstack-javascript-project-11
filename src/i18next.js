import i18next from 'i18next';

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
                },
                errors: {
                    required: 'Поле не может быть пустым',
                    url: 'Ссылка должна быть валидным URL',
                    notOneOf: 'RSS-поток уже добавлен',
                    network: 'Ошибка сети',
                    unknown: 'Неизвестная ошибка',
                },
            },
        },
    },
});

export default i18next;
