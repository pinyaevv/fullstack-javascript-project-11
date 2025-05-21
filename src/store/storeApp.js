import { makeAutoObservable } from 'mobx'

class RssStore {
  feeds = []

  posts = []

  addedUrls = []

  readPosts = []

  process = { state: 'ready', error: null }

  ui = { inputValue: '' }

  previewPost = null

  constructor() {
    makeAutoObservable(this)
  }

  setLoading() {
    this.process = { state: 'sending', error: null }
  }

  setSuccess() {
    this.process = { state: 'success', error: null }
    this.ui.inputValue = ''
  }

  setError(error) {
    this.process = { state: 'error', error }
  }

  addFeed(feed) {
    this.feeds.unshift(feed)
    this.addedUrls.push(feed.url)
  }

  addPosts(posts) {
    this.posts = [...posts, ...this.posts]
  }

  setPreviewPost(post) {
    this.previewPost = post
  }

  markAsRead(postLink) {
    if (!this.readPosts.includes(postLink)) {
      this.readPosts = [...this.readPosts, postLink]
    }
  }
}

const store = new RssStore()
export default store
