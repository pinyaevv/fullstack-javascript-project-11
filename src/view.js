import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal } from 'bootstrap';
import { escape as escapeHtml } from 'lodash';
import { reaction } from 'mobx';

const createView = (elements, i18next, store) => {
  const localElements = { ...elements };
  const modal = localElements.modal ? new Modal(localElements.modal) : null;

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

  reaction(
    () => ({
      feeds: store.feeds,
      posts: store.posts,
      readPosts: store.readPosts,
    }),
    ({ feeds, posts, readPosts }) => {
      if (localElements.feedsContainer) {
        localElements.feedsContainer.innerHTML = feeds.map(renderFeed).join('');
      }
      if (localElements.postsContainer) {
        localElements.postsContainer.innerHTML = posts
          .map((post) => renderPost(post, readPosts.has(post.link)))
          .join('');
      }
    },
  );

  const showLoading = () => {
    if (localElements.feedback) {
      localElements.feedback.textContent = i18next.t('rssForm.loading');
      localElements.feedback.className = 'feedback text-info';
    }
  };

  const showSuccess = (message) => {
    if (localElements.feedback && localElements.input) {
      localElements.feedback.textContent = message;
      localElements.feedback.className = 'feedback text-success';
      localElements.input.classList.remove('is-invalid');
    }
  };

  const showError = (message) => {
    if (localElements.feedback && localElements.input) {
      localElements.feedback.textContent = message;
      localElements.feedback.className = 'feedback text-danger';
      localElements.input.classList.add('is-invalid');
    }
  };

  const clearInput = () => {
    if (localElements.input) {
      localElements.input.value = '';
      localElements.input.classList.remove('is-invalid');
    }
  };

  return {
    init() {
      if (localElements.title) localElements.title.textContent = i18next.t('rssForm.title');
      if (localElements.description) localElements.description.textContent = i18next.t('rssForm.description');
      if (localElements.inputLabel) localElements.inputLabel.textContent = i18next.t('rssForm.inputPlaceholder');
      if (localElements.submitButton) localElements.submitButton.textContent = i18next.t('rssForm.submitButton');

      return {
        initFormHandler: (formHandSubm) => {
          localElements.form?.addEventListener('submit', (e) => {
            e.preventDefault();
            formHandSubm(localElements.input?.value.trim());
          });
        },
        initPreviewHandlers: (onPreview) => {
          localElements.postsContainer?.addEventListener('click', (e) => {
            const btn = e.target.closest('.preview-btn');
            if (btn) {
              e.preventDefault();
              const post = onPreview(btn.dataset.link);
              if (post && modal) {
                const modalTitle = localElements.modal.querySelector('.modal-title');
                const modalBody = localElements.modal.querySelector('.modal-body');
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
    showLoading,
    showSuccess,
    showError,
    clearInput,
  };
};

export default createView;
