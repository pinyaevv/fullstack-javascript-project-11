import { proxy, subscribe } from 'valtio';

const createStore = (initialState) => {
  const state = proxy(initialState);

  return {
    state,
    subscribe(callback) {
      return subscribe(state, () => callback(state));
    },
    update(updater) {
      const newState = typeof updater === 'function' ? updater(state) : updater;
      Object.assign(state, newState);
    },
  };
};

export default createStore;
