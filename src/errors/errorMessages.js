const ERROR_MESSAGES = {
  ValidationError: (error) => error.errors[0],
  InvalidRSS: (_, i18n) => i18n.t('errors.invalidRss'),
  InvalidResponse: (_, i18n) => i18n.t('errors.invalidResponse'),
  NetworkError: (_, i18n) => i18n.t('errors.network'),
  default: (_, i18n) => i18n.t('errors.unknown'),
}

const getErrorMessage = (error, i18n) => {
  const type = error.name || error.message
  const handler = ERROR_MESSAGES[type] || ERROR_MESSAGES.default
  return handler(error, i18n)
}

export default getErrorMessage
