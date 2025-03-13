import onChange from 'on-change';

class View {
    constructor(form, input, feedback) {
        this.form = form;
        this.input = input;
        this.feedback = feedback;

        this.state = onChange(
            {
                form: {
                    valid: true,
                    error: null,
                    url: '',
                },
            },
            this.render.bind(this)
        );
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
      }
};

export default View;
