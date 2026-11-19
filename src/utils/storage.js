/**
 * LocalStorage Persistence Utility
 */

const STORAGE_PREFIX = 'wastewise_v1_';

export const storage = {
  get: (key, defaultValue) => {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (err) {
      console.warn(`Error reading ${key} from localStorage:`, err);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (err) {
      console.error(`Error saving ${key} to localStorage:`, err);
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (err) {
      console.error(`Error removing ${key} from localStorage:`, err);
    }
  },

  clearAll: () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (err) {
      console.error('Error clearing localStorage:', err);
    }
  }
};
