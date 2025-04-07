import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal } from 'bootstrap';
import { escape as escapeHtml } from 'lodash';

const renderFeed = (feed, escapeFn) => `
  <div class="card mb-3">
    <div class="card-body">
      <h4>${escapeFn(feed.title)}</h4>
      <p>${escapeFn(feed.description)}</p>
    </div>
  </div>
`;

const renderPost = (post, isRead, previewText, escapeFn) => `
  <div class="card mb-3">
    <div class="card-body d-flex justify-content-between align-items-center">
      <a href="${escapeFn(post.link)}" 
        target="_blank"
        class="${isRead ? 'fw-normal' : 'fw-bold'}">
        ${escapeFn(post.title)}
      </a>
      <button class="btn btn-sm btn-outline-primary preview-btn"
        data-link="${escapeFn(post.link)}">
        ${previewText}
      </button>
    </div>
  </div>
`;

const createView = (initialElements, i18next) => {
  const elements = { ...initialElements };
  const modal = elements.modal ? new Modal(elements.modal) : null;

  const clearInput = () => {
    const newElements = { ...elements };
    newElements.input.value = '';
    newElements.input.classList.remove('is-invalid');
    newElements.input.blur();
  };

  return {
    setTranslations() {
      const newElements = { ...elements };
      newElements.title.textContent = i18next.t('rssForm.title');
      newElements.description.textContent = i18next.t('rssForm.description');
      newElements.inputLabel.textContent = i18next.t('rssForm.inputPlaceholder');
      newElements.submitButton.textContent = i18next.t('rssForm.submitButton');
    },

    renderFeeds(feeds) {
      const newElements = { ...elements };
      newElements.feedsContainer.innerHTML = feeds
        .map((feed) => renderFeed(feed, escapeHtml))
        .join('');
    },

    renderPosts(posts, readPosts) {
      const newElements = { ...elements };
      newElements.postsContainer.innerHTML = posts
        .map((post) => renderPost(
          post,
          readPosts.has(post.link),
          i18next.t('ui.preview'),
          escapeHtml,
        ))
        .join('');
    },

    showPostModal(title, content) {
      if (!modal) return;
      const newElements = { ...elements };
      newElements.feedback.textContent = '';
      newElements.feedback.className = 'feedback';

      const modalTitle = newElements.modal.querySelector('.modal-title');
      const modalBody = newElements.modal.querySelector('.modal-body');
      modalTitle.textContent = title;
      modalBody.textContent = content;
      modal.show();
    },

    showLoading() {
      const newElements = { ...elements };
      newElements.feedback.textContent = i18next.t('rssForm.loading');
      newElements.feedback.className = 'feedback text-info';
    },

    showSuccess(message) {
      const newElements = { ...elements };
      newElements.feedback.textContent = message;
      newElements.feedback.className = 'feedback text-success';
      newElements.input.classList.remove('is-invalid');
    },

    showError(message) {
      clearInput();
      const newElements = { ...elements };
      newElements.feedback.textContent = message;
      newElements.feedback.className = 'feedback text-danger';
      newElements.input.classList.add('is-invalid');
    },

    initFormHandler(callback) {
      const newElements = { ...elements };
      newElements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        callback(newElements.input.value.trim());
      });
    },

    initPreviewHandlers(callback) {
      const newElements = { ...elements };
      newElements.postsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.preview-btn');
        if (btn) callback(btn.dataset.link);
      });
    },

    clearInput,
  };
};

export default createView;
