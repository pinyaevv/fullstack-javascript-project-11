import { reaction } from 'mobx'
import { escape as escapeHtml } from 'lodash'
import { Modal } from 'bootstrap'

const renderFeed = (feed) => `
  <div class="card mb-3">
    <div class="card-body">
      <h4>${escapeHtml(feed.title)}</h4>
      <p>${escapeHtml(feed.description)}</p>
    </div>
  </div>
`

const renderPost = (post, isRead, previewLabel) => `
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
        ${previewLabel}
      </button>
    </div>
  </div>
`

const initViewWatchers = (store, elements, i18next) => {
  const modal = elements.modal ? new Modal(elements.modal) : null // Modal используется тут.

  reaction(
    () => ({
      feeds: store.feeds,
      posts: store.posts,
      readPosts: store.ui.readPosts,
      previewPost: store.previewPost,
    }),
    ({
      feeds, posts, readPosts, previewPost,
    }) => {
      if (elements.feedsContainer) {
        elements.feedsContainer.innerHTML = feeds.map(renderFeed).join('')
      }

      if (elements.postsContainer) {
        elements.postsContainer.innerHTML = posts
          .map(post => {
            const isRead = readPosts.includes(post.link)
            return renderPost(post, isRead, i18next.t('ui.preview'))
          })
          .join('')
      }

      if (previewPost && modal) {
        const modalTitle = elements.modal.querySelector('.modal-title')
        const modalBody = elements.modal.querySelector('.modal-body')
        if (modalTitle && modalBody) {
          modalTitle.textContent = previewPost.title
          modalBody.innerHTML = previewPost.description
          modal.show()
        }
      }
    },
    {
      fireImmediately: true,
      name: 'viewReaction',
    },
  )
}

export default initViewWatchers
