import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal } from 'bootstrap';

export default class View {
  constructor(elements, i18next) {
    this.elements = elements;
    this.i18next = i18next;
    this.modal = elements.modal ? new Modal(elements.modal) : null;
  }

  setTranslations() {
    const {
      title,
      description,
      inputLabel,
      submitButton,
    } = this.elements;

    title.textContent = this.i18next.t('rssForm.title');
    description.textContent = this.i18next.t('rssForm.description');
    inputLabel.textContent = this.i18next.t('rssForm.inputPlaceholder');
    submitButton.textContent = this.i18next.t('rssForm.submitButton');
  }

  escape(html) {
    // eslint-disable-next-line class-methods-use-this, no-unused-expressions
    (this);
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  renderFeeds(feeds) {
    this.elements.feedsContainer.innerHTML = feeds.map((feed) => `
      <div class="card mb-3">
        <div class="card-body">
          <h4>${this.escape(feed.title)}</h4>
          <p>${this.escape(feed.description)}</p>
        </div>
      </div>
    `).join('');
  }

  renderPosts(posts, readPosts) {
    this.elements.postsContainer.innerHTML = posts.map((post) => `
      <div class="card mb-3">
        <div class="card-body d-flex justify-content-between align-items-center">
          <a href="${this.escape(post.link)}" 
             target="_blank"
             class="${readPosts.has(post.link) ? 'fw-normal' : 'fw-bold'}">
            ${this.escape(post.title)}
          </a>
          <button class="btn btn-sm btn-outline-primary preview-btn"
                  data-link="${this.escape(post.link)}">
            ${this.i18next.t('ui.preview')}
          </button>
        </div>
      </div>
    `).join('');
  }

  showPostModal(title, content) {
    if (!this.modal) return;
    const modalTitle = this.elements.modal.querySelector('.modal-title');
    const modalBody = this.elements.modal.querySelector('.modal-body');
    modalTitle.textContent = this.escape(title);
    modalBody.textContent = content;
    this.modal.show();
  }

  showLoading() {
    this.elements.feedback.textContent = this.i18next.t('rssForm.loading');
    this.elements.feedback.className = 'feedback text-info';
  }

  showSuccess(message) {
    this.elements.feedback.textContent = message;
    this.elements.feedback.className = 'feedback text-success';
    this.elements.input.classList.remove('is-invalid');
  }

  showError(message) {
    this.clearInput();
    this.elements.feedback.textContent = message;
    this.elements.feedback.className = 'feedback text-danger';
    this.elements.input.classList.add('is-invalid');
  }

  initFormHandler(callback) {
    this.elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      callback(this.elements.input.value.trim());
    });
  }

  initPreviewHandlers(callback) {
    this.elements.postsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.preview-btn');
      if (btn) callback(btn.dataset.link);
    });
  }

  clearInput() {
    this.elements.input.value = '';
    this.elements.input.classList.remove('is-invalid');
    this.elements.input.blur();
  }
}
