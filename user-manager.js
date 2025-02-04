import { db, ref, set, onValue, remove } from './firebase-init.js';

class UserManager {
  constructor() {
    this.currentUserId = this.getCookie('userId');
    this.username = this.getCookie('username');
    this.isOnline = false;
    
    if (!this.currentUserId || !this.username) {
      this.currentUserId = Math.random().toString(36).substring(2);
      this.username = 'User_' + Math.random().toString(36).substring(2, 6);
      this.setCookie('userId', this.currentUserId, 365);
      this.setCookie('username', this.username, 365);
    }
  }

  async connect() {
    try {
      // Test connection
      const testRef = ref(db, 'test');
      await set(testRef, { timestamp: Date.now() });
      
      // Set online status
      const userStatusRef = ref(db, 'status/' + this.currentUserId);
      await set(userStatusRef, {
        online: true,
        username: this.username,
        timestamp: Date.now()
      });

      // Remove status on disconnect
      window.addEventListener('beforeunload', () => {
        remove(userStatusRef);
      });

      this.isOnline = true;
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      return false;
    }
  }

  listenToOnlineUsers(callback) {
    const statusRef = ref(db, 'status');
    onValue(statusRef, (snapshot) => {
      const users = snapshot.val() || {};
      callback(Object.keys(users).length);
    });
  }

  setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
  }

  getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=');
      return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
  }
}

export default UserManager; 