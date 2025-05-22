import { makeAutoObservable } from 'mobx'

class RssStore {
  feeds = []

  posts = []

  addedUrls = []

  ui = {
    inputValue: '',
    readPosts: [],
  }

  form = { state: 'ready', error: null }

  previewPost = null

  constructor() {
    makeAutoObservable(this)
  }

  setLoading() {
    this.form = { state: 'sending', error: null }
  }

  setSuccess() {
    this.form = { state: 'success', error: null }
    this.ui.inputValue = ''
  }

  setError(error) {
    this.form = { state: 'error', error }
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
    if (!this.ui.readPosts.includes(postLink)) {
      this.ui.readPosts = [...this.ui.readPosts, postLink]
    }
  }
}

const store = new RssStore()
export default store
