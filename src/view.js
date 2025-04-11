import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal } from 'bootstrap';
import { escape as escapeHtml } from 'lodash';

const createView = (initialElements, i18next, store) => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    feedback: document.querySelector('.feedback'),
    feedsContainer: document.getElementById('feeds'),
    postsContainer: document.getElementById('posts'),
    modal: document.getElementById('postModal'),
    title: document.querySelector('[data-i18n="title"]'),
    description: document.querySelector('[data-i18n="description"]'),
    inputLabel: document.querySelector('label[for="url-input"]'),
    submitButton: document.querySelector('[type="submit"]'),
  };

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

  const handleStateChange = (state) => {
    if (elements.feedsContainer) {
      elements.feedsContainer.innerHTML = state.feeds.map(renderFeed).join('');
    }
    if (elements.postsContainer) {
      elements.postsContainer.innerHTML = state.posts
        .map((post) => renderPost(post, state.readPosts.has(post.link)))
        .join('');
    }

    switch (state.process.state) {
      case 'sending':
        elements.feedback.textContent = i18next.t('rssForm.loading');
        elements.feedback.className = 'feedback text-info';
        break;
      case 'success':
        elements.feedback.textContent = i18next.t('rssForm.success');
        elements.feedback.className = 'feedback text-success';
        elements.input.classList.remove('is-invalid');
        elements.input.value = '';
        break;
      case 'error':
        elements.feedback.textContent = state.process.error;
        elements.feedback.className = 'feedback text-danger';
        elements.input.classList.add('is-invalid');
        break;
      default:
        elements.input.value = '';
        elements.input.classList.remove('is-invalid');
    }
  };

  store.subscribe(handleStateChange);

  return {
    initialization() {
      if (elements.title) elements.title.textContent = i18next.t('rssForm.title');
      if (elements.description) elements.description.textContent = i18next.t('rssForm.description');
      if (elements.inputLabel) elements.inputLabel.textContent = i18next.t('rssForm.inputPlaceholder');
      if (elements.submitButton) elements.submitButton.textContent = i18next.t('rssForm.submitButton');

      return {
        initFormHandler: (sendButtonHandler) => {
          elements.form?.addEventListener('submit', (e) => {
            e.preventDefault();
            sendButtonHandler(elements.input.value.trim());
          });
        },
        initPreviewHandlers: (onPostPreview) => {
          elements.postsContainer?.addEventListener('click', (e) => {
            const btn = e.target.closest('.preview-btn');
            if (btn) {
              e.preventDefault();
              const post = onPostPreview(btn.dataset.link);
              if (post && modal) {
                const modalTitle = elements.modal.querySelector('.modal-title');
                const modalBody = elements.modal.querySelector('.modal-body');
                if (modalTitle && modalBody) {
                  modalTitle.textContent = post.title;
                  modalBody.innerHTML = post.description;
                  modal.show();
                }
              }
            }
          });
        },
      };
    },
  };
};

export default createView;
