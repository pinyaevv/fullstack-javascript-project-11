import onChange from 'on-change';

class View {
    constructor(form, input, feedback, feedsContainer, postsContainer) {
        this.form = form;
        this.input = input;
        this.feedback = feedback;
        this.feedsContainer = feedsContainer;
        this.postsContainer = postsContainer;

        this.state = onChange(
            {
                form: {
                    valid: true,
                    error: null,
                    url: '',
                },
                feeds: [],
                posts: [],
            },
            this.render.bind(this)
        );
    }

    addFeed(feed) {
      this.state.feeds.push(feed);
    }

    addPost(post) {
       this.state.posts.push(post);
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
          .map((post) => `
            <div class="card mb-3">
              <div class="card-body">
                <a href="${post.link}" target="_blank" class="card-link">${post.title}</a>
              </div>
            </div>
          `)
          .join('');
      }
};

export default View;
