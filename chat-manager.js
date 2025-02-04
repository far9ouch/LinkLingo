import { db, ref, set, onValue, push, remove } from './firebase-init.js';

class ChatManager {
  constructor(userId, username) {
    this.userId = userId;
    this.username = username;
    this.currentChatId = null;
    this.partnerId = null;
    this.isConnected = false;
    this.skipCount = 0;
  }

  async findNewChat() {
    const waitingRef = ref(db, 'waiting');
    await remove(ref(db, `waiting/${this.userId}`));

    onValue(waitingRef, async (snapshot) => {
      if (this.isConnected) return;
      
      const waitingUsers = snapshot.val() || {};
      const waitingIds = Object.keys(waitingUsers)
        .filter(id => id !== this.userId);
      
      if (waitingIds.length > 0) {
        this.partnerId = waitingIds[0];
        this.currentChatId = Math.random().toString(36).substring(2);
        
        await set(ref(db, `chats/${this.currentChatId}`), {
          users: {
            [this.userId]: this.username,
            [this.partnerId]: waitingUsers[this.partnerId].username
          },
          messages: []
        });
        
        await remove(ref(db, `waiting/${this.partnerId}`));
        this.isConnected = true;
        this.onConnect();
      } else {
        await set(ref(db, `waiting/${this.userId}`), {
          username: this.username,
          timestamp: Date.now()
        });
      }
    });
  }

  listenToMessages(callback) {
    if (!this.currentChatId) return;
    
    const messagesRef = ref(db, `chats/${this.currentChatId}/messages`);
    onValue(messagesRef, (snapshot) => {
      const messages = snapshot.val() || {};
      callback(messages);
    });
  }

  async sendMessage(text) {
    if (!this.currentChatId || !text.trim()) return;

    const messagesRef = ref(db, `chats/${this.currentChatId}/messages`);
    await push(messagesRef, {
      text: text,
      sender: this.userId,
      username: this.username,
      timestamp: Date.now()
    });
  }

  async skip() {
    if (this.skipCount >= 3) {
      throw new Error('Maximum skips reached');
    }
    
    this.skipCount++;
    this.isConnected = false;
    
    if (this.currentChatId) {
      await remove(ref(db, `chats/${this.currentChatId}`));
    }
    
    this.currentChatId = null;
    this.partnerId = null;
    
    await this.findNewChat();
  }

  onConnect() {
    // Override this method in chat.html
  }
}

export default ChatManager; 