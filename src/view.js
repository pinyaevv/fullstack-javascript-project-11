import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal } from 'bootstrap';
import { escape as escapeHtml } from 'lodash';

const createView = (initialElements, i18next) => {
  const elements = { ...initialElements };
  const modal = elements.modal ? new Modal(elements.modal) : null;

  const renderFeed = (feed) => `
    <div class="card mb-3">
      <div class="card-body">
        <h4>${escapeHtml(feed.title)}</h4>
        <p>${escapeHtml(feed.description)}</p>
      </div>
    </div>
  `;

  const renderPost = (post, isRead) => `
    <div class="card mb-3">
      <div class="card-body d-flex justify-content-between align-items-center">
        <a href="${escapeHtml(post.link)}" 
          target="_blank"
          class="${isRead ? 'fw-normal' : 'fw-bold'}">
          ${escapeHtml(post.title)}
        </a>
        <button type="button" 
                class="btn btn-sm btn-outline-primary preview-btn"
                data-link="${escapeHtml(post.link)}">
          ${i18next.t('ui.preview')}
        </button>
      </div>
    </div>
  `;

  return {
    setTranslations() {
      elements.title.textContent = i18next.t('rssForm.title');
      elements.description.textContent = i18next.t('rssForm.description');
      elements.inputLabel.textContent = i18next.t('rssForm.inputPlaceholder');
      elements.submitButton.textContent = i18next.t('rssForm.submitButton');
    },

    renderFeeds(feeds) {
      elements.feedsContainer.innerHTML = feeds.map(renderFeed).join('');
    },

    renderPosts(posts, readPosts) {
      elements.postsContainer.innerHTML = posts
        .map((post) => renderPost(post, readPosts.has(post.link)))
        .join('');
    },

    showPostModal(title, content) {
      if (!modal) return;

      const modalTitle = elements.modal.querySelector('.modal-title');
      const modalBody = elements.modal.querySelector('.modal-body');

      modalTitle.textContent = title;
      modalBody.innerHTML = content;
      modal.show();
    },

    showLoading() {
      elements.feedback.textContent = i18next.t('rssForm.loading');
      elements.feedback.className = 'feedback text-info';
    },

    showSuccess(message) {
      elements.feedback.textContent = message;
      elements.feedback.className = 'feedback text-success';
      elements.input.classList.remove('is-invalid');
      this.clearInput();
    },

    showError(message) {
      this.clearInput();
      elements.feedback.textContent = message;
      elements.feedback.className = 'feedback text-danger';
      elements.input.classList.add('is-invalid');
    },

    initFormHandler(callback) {
      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        callback(elements.input.value.trim());
      });
    },

    initPreviewHandlers(callback) {
      elements.postsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.preview-btn');
        if (btn) {
          e.preventDefault();
          e.stopPropagation();
          callback(btn.dataset.link);
        }
      });
    },

    clearInput() {
      elements.input.value = '';
      elements.input.classList.remove('is-invalid');
      elements.input.blur();
    },
  };
};

export default createView;
