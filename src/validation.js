import * as yup from 'yup';
import i18next from './i18next.js';

yup.setLocale({
  mixed: {
    required: i18next.t('errors.required'),
    notOneOf: i18next.t('errors.notOneOf'),
  },
  string: {
    url: i18next.t('errors.url'),
  },
});

export const createSchema = () => {
  return yup.object().shape({
    url: yup
      .string()
      .required()
      .url(),
  });
};
