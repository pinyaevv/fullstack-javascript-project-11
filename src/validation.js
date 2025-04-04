import * as yup from 'yup';

const createSchema = (i18next, addedUrls = []) => {
  yup.setLocale({
    mixed: {
      required: i18next.t('errors.required'),
      notOneOf: i18next.t('errors.notOneOf'),
    },
    string: {
      url: i18next.t('errors.url'),
    },
  });

  return yup.object().shape({
    url: yup
      .string()
      .required()
      .url()
      .notOneOf(addedUrls),
  });
};

export default createSchema;
