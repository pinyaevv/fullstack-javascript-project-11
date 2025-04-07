import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal } from 'bootstrap';
import { escape } from 'lodash';

const renderFeed = (feed, escape) => `
  <div class="card mb-3">
    <div class="card-body">
      <h4>${escape(feed.title)}</h4>
      <p>${escape(feed.description)}</p>
    </div>
  </div>
`;

const renderPost = (post, isRead, previewText, escape) => `
  <div class="card mb-3">
    <div class="card-body d-flex justify-content-between align-items-center">
      <a href="${escape(post.link)}" 
        target="_blank"
        class="${isRead ? 'fw-normal' : 'fw-bold'}">
        ${escape(post.title)}
      </a>
      <button class="btn btn-sm btn-outline-primary preview-btn"
        data-link="${escape(post.link)}">
        ${previewText}
      </button>
    </div>
  </div>
`;

const createView = (elements, i18next) => {
  const modal = elements.modal ? new Modal(elements.modal) : null;

  return {
    setTranslations() {
      const {
        title, description, inputLabel, submitButton,
      } = elements;
      title.textContent = i18next.t('rssForm.title');
      description.textContent = i18next.t('rssForm.description');
      inputLabel.textContent = i18next.t('rssForm.inputPlaceholder');
      submitButton.textContent = i18next.t('rssForm.submitButton');
    },

    renderFeeds(feeds) {
      elements.feedsContainer.innerHTML = feeds
        .map((feed) => renderFeed(feed, escape))
        .join('');
    },

    renderPosts(posts, readPosts) {
      elements.postsContainer.innerHTML = posts
        .map((post) => renderPost(
          post,
          readPosts.has(post.link),
          i18next.t('ui.preview'),
          escape,
        ))
        .join('');
    },

    showPostModal(title, content) {
      if (!modal) return;
      elements.feedback.textContent = '';
      elements.feedback.className = 'feedback';

      const modalTitle = elements.modal.querySelector('.modal-title');
      const modalBody = elements.modal.querySelector('.modal-body');
      modalTitle.textContent = title;
      modalBody.textContent = content;
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
        if (btn) callback(btn.dataset.link);
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
