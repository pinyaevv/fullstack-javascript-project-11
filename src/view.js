import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
import onChange from 'on-change';

class View {
    constructor(form, input, feedback, feedsContainer, postsContainer, state) {
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

        this.state = onChange(
            {
                form: {
                    valid: true,
                    error: null,
                    url: '',
                },
                feeds: [],
                posts: [],
                ...state,
            },
            this.render.bind(this)
        );
    }

    addFeed(feed) {
      this.state.feeds.push(feed);
    }

    addPost(newPost) {
      const postToAdd = Array.isArray(newPost) ? newPost : [newPost];
       this.state.posts = [...this.state.posts, ...postToAdd];
    }
    
    clearForm() {
      this.state.form.url = '';
      this.state.form.valid = true;
      this.state.form.error = null;
      this.input.focus();
    }

    setError(error) {
      this.state.form.valid = false;
      this.state.form.error = error;
    }

    markAsRead(postId) {
      this.state.readPosts.add(postId);
      this.render();
    }

    escapeHtml(unsafe) {
      if (typeof unsafe !== 'string') return '';
      return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    cleanHtmlDescription(html) {
      if (!html) return '';
  
      const div = document.createElement('div');
      div.innerHTML = html;

      return div.textContent || '';
    }

    render() {
        if (!this.feedback) {
          console.error('Элемент feedback не найден');
          return;
        }

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
                <div class="card-body">
                  <a href="${this.escapeHtml(post.link)}" 
                     target="_blank" 
                     class="card-link ${isRead ? 'fw-normal' : 'fw-bold'}">
                    ${this.escapeHtml(post.title)}
                  </a>
                  <button class="btn btn-sm btn-primary preview-btn"
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
      
          const postLink = btn.dataset.postLink;
          const post = this.state.posts.find(p => p.link === postLink);
          
          if (post) {
            this.modalTitle.textContent = post.title;
            this.modalBody.innerHTML = this.cleanHtmlDescription(post.description);
            this.modal.show();
            this.markAsRead(postLink);
          }
        });
      }
};

export default View;
