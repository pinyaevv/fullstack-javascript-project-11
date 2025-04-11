import { makeAutoObservable } from 'mobx';

class RssStore {
  feeds = [];

  posts = [];

  addedUrls = [];

  readPosts = new Set();

  process = { state: 'ready', error: null };

  ui = { inputValue: '' };

  constructor() {
    makeAutoObservable(this);
  }

  setLoading() {
    this.process = { state: 'sending', error: null };
  }

  setSuccess() {
    this.process = { state: 'success', error: null };
    this.ui.inputValue = '';
  }

  setError(error) {
    this.process = { state: 'error', error };
  }

  addFeed(feed) {
    this.feeds.unshift(feed);
    this.addedUrls.push(feed.url);
  }

  addPosts(posts) {
    this.posts = [...posts, ...this.posts];
  }

  markAsRead(postLink) {
    this.readPosts.add(postLink);
  }
}

const store = new RssStore();
export default store;

// не знаю почему, но valtio у меня не заработал..
// воспользовался mobx, правда собрал эту структуру через нейросетку.
// вносил эту правку в самом конце, поэтому может где-то в коде намудрил, особенно во View.js
