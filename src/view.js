import onChange from 'on-change';

class View {
    constructor(form, input, feedback, feedsContainer, postsContainer, state) {
        this.form = form;
        this.input = input;
        this.feedback = feedback;
        this.feedsContainer = feedsContainer;
        this.postsContainer = postsContainer;
        this.state = state;
        this.modal = new bootstrap.Modal(document.getElementById('postModal'));
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
                  <a href="${post.link}" target="_blank" class="card-link ${isRead ? 'fw-normal' : 'fw-bold'}">${post.title}</a>
                  <button type="button" class="btn btn-primary preview-btn" data-bs-target="#postModal"
                      data-post-link="${post.link}"
                      data-post-title="${post.title}"
                      data-post-description="${post.description}">
                    Просмотр
                  </button>
                </div>
              </div>
            `;
          })
          .join('');

          document.querySelectorAll('.preview-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const link = e.target.dataset.postLink;
              const title = e.target.dataset.postTitle;
              const description = e.target.dataset.postDescription;

              this.modalTitle.textContent = title;
              this.modalBody.innerHTML = description;
              this.modal.show();

              this.markAsRead(link);
            });
          });
      }
};

export default View;
