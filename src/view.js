import 'bootstrap/dist/css/bootstrap.min.css'

const createView = (elements, i18next) => {
  const localElements = { ...elements }

  const showLoading = () => {
    if (localElements.feedback) {
      localElements.feedback.textContent = i18next.t('rssForm.loading')
      localElements.feedback.className = 'feedback text-info'
    }
  }

  const showSuccess = (message) => {
    if (localElements.feedback && localElements.input) {
      localElements.feedback.textContent = message
      localElements.feedback.className = 'feedback text-success'
      localElements.input.classList.remove('is-invalid')
    }
  }

  const showError = (message) => {
    if (localElements.feedback && localElements.input) {
      localElements.feedback.textContent = message
      localElements.feedback.className = 'feedback text-danger'
      localElements.input.classList.add('is-invalid')
    }
  }

  const clearInput = () => {
    if (localElements.input) {
      localElements.input.value = ''
      localElements.input.classList.remove('is-invalid')
    }
  }

  const initFormHandler = (formSubmitHandler) => {
    localElements.form?.addEventListener('submit', (e) => {
      e.preventDefault()
      formSubmitHandler(localElements.input?.value.trim())
    })
  }

  const initPreviewHandlers = (onPreview) => {
    localElements.postsContainer?.addEventListener('click', (e) => {
      const btn = e.target.closest('.preview-btn')
      if (btn) {
        e.preventDefault()
        onPreview(btn.dataset.link)
      }
    })
  }

  return {
    initFormHandler,
    initPreviewHandlers,
    showLoading,
    showSuccess,
    showError,
    clearInput,
  }
}

export default createView
