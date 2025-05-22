import { reaction } from 'mobx'

const initFormStateWatcher = (store, view, i18next) => reaction(
  () => store.form.state,
  (state) => {
    switch (state) {
      case 'sending':
        view.showLoading()
        break
      case 'success':
        view.showSuccess(i18next.t('rssForm.success'))
        break
      case 'error':
        view.showError(store.form.error)
        break
      default:
        view.clearInput()
    }
  },
)

export default initFormStateWatcher
