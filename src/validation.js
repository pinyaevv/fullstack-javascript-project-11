import * as yup from 'yup';

const addFeeds = [];

const schema = yup.object().shape({
    url: yup
      .string()
      .required('Link must not be empty')
      .url('Link must be a valid URL')
      .notOneOf(addFeeds, 'RSS feed already added'),
});

export default schema;
