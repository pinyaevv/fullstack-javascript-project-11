import 'bootstrap/dist/css/bootstrap.min.css';
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
import onChange from 'on-change';

class View {
  constructor(form, input, feedback, feedsContainer, postsContainer, state) {
    console.log('Инициализация View...');
    this.form = form;
    this.input = input;
    this.feedback = feedback;
    this.feedsContainer = feedsContainer;
    this.postsContainer = postsContainer;
    this.state = state;

    const modalElement = document.getElementById('postModal');
    this.modal = modalElement ? new bootstrap.Modal(modalElement) : null;
    this.modalTitle = document.getElementById('modalTitle');
    this.modalBody = document.getElementById('modalBody');
    this.addedUrls = new Set(state.addedUrls || []);

    this.state = onChange({
      form: { valid: true, error: null, url: '' },
      feeds: [],
      posts: [],
      addedUrls: [...this.addedUrls],
      ...state,
    }, this.render.bind(this));
  }

  addFeed(feed) {
    console.log('Добавление фида:', feed.title);
    this.state.feeds.push(feed);
  }

  addPost(newPost) {
    console.log('Добавление поста(ов):', Array.isArray(newPost) ? newPost.length : 1);
    const postsToAdd = Array.isArray(newPost) ? newPost : [newPost];
    const uniquePosts = postsToAdd.filter((post) => (
      !this.state.posts.some(p => p.link === post.link)
    ));

    if (uniquePosts.length > 0) {
      this.state.posts = [...this.state.posts, ...uniquePosts];
      console.log(`Добавлено ${uniquePosts.length} новых постов, всего: ${this.state.posts.length}`);
    }
  }

  addUrl(url) {
    if (!url) return;
    const normalizedUrl = url.trim().toLowerCase();
    this.addedUrls.add(normalizedUrl);
    this.state.addedUrls = [...this.addedUrls];
    console.log(`Url добавлен: ${url}`);
  }

  hasUrl(url) {
    if (!this.addedUrls) {
      console.error('addedUrls не инициализирован');
      this.addedUrls = new Set();
      return false;
    }
    return this.addedUrls.has(url.trim().toLowerCase());
  }

  clearForm() {
    this.state.form.url = '';
    this.state.form.valid = true;
    this.state.form.error = null;
    this.input.focus();
  }

  setError(error) {
    console.warn('Установка ошибки:', error);
    this.state.form.valid = false;
    this.state.form.error = error;
  }

  markAsRead(postId) {
    console.log('Помечено как прочитанное:', postId);
    this.state.readPosts.add(postId);
    this.render();
  }

  escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    if (this.someConfig?.escapeHtml === false) return unsafe;
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  cleanHtmlDescription(html) {
    if (!html) return '';
    const container = this.cleanContainer || document.createElement('div');
    container.innerHTML = html;
    return container.textContent || '';
  }

  showSuccess(message) {
    if (!this.state.form) {
      this.state.form = {
        valid: true,
        error: null,
        url: '',
        successMessage: message,
      };
    }

    this.state.form.valid = true;
    this.state.form.error = null;
    this.state.form.successMessage = message;

    if (this.feedback) {
      this.feedback.textContent = message;
      this.feedback.classList.add('text-success', 'd-block');
      this.feedback.classList.remove('text-danger');
    }
  }

  render() {
    this.input.value = this.state.form.url;

    if (!this.state.form.valid) {
      this.input.classList.add('is-invalid');
      this.feedback.textContent = this.state.form.error;
      this.feedback.classList.add('text-danger');
    } else {
      this.input.classList.remove('is-invalid');
      this.feedback.textContent = '';
      this.feedback.classList.remove('text-danger');
    }

    this.feedsContainer.innerHTML = this.state.feeds
      .map((feed) => `
            <div class="card mb-3">
              <div class="card-body">
                <h4 class="card-title">${feed.title}</h4>
                <p class="card-description">${feed.description}</p>
              </div>
            </div>
          `)
      .join('');

    this.postsContainer.innerHTML = this.state.posts
      .map((post) => {
        const isRead = this.state.readPosts.has(post.link);
        return `
              <div class="card mb-3">
                <div class="card-body d-flex justify-content-between align-items-center">
                  <a href="${this.escapeHtml(post.link)}" 
                     target="_blank" 
                     class="${isRead ? 'fw-normal' : 'fw-bold'}">
                    ${this.escapeHtml(post.title)}
                  </a>
                  <button class="btn btn-sm btn-outline-primary preview-btn"
                          data-post-link="${this.escapeHtml(post.link)}">
                    Просмотр
                  </button>
                </div>
              </div>
            `;
      })
      .join('');

    this.setupPreviewHandlers();
  }

  setupPreviewHandlers() {
    this.postsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.preview-btn');
      if (!btn || !this.modal) return;

      const { postLink } = btn.dataset;
      const post = this.state.posts.find((p) => p.link === postLink);

      if (post) {
        this.modalTitle.textContent = post.title || 'Без заголовка';
        this.modalBody.innerHTML = this.cleanHtmlDescription(post.description);
        this.modal.show();
        this.markAsRead(postLink);
      }
    });
  }
}

export default View;
