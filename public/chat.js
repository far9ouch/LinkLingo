// Add ESC key handling
let escPressCount = 0;
let skipTimer = null;

const socket = io('/.netlify/functions/server', {
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

// Connection status handling
socket.on('connect', () => {
  console.log('Connected to server with ID:', socket.id);
  socket.emit('join');
});

socket.on('onlineUsers', (count) => {
  console.log('Online users updated:', count);
  onlineCount.textContent = `${count} online`;
});

socket.on('joined', () => {
  console.log('Joined successfully');
  socket.emit('findPartner');
});

// Add connection error handling
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  statusElement.innerHTML = `
    <span class="status-dot" style="background: red"></span>
    Connection failed. Please refresh.
  `;
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
  statusElement.innerHTML = `
    <span class="status-dot" style="background: red"></span>
    Disconnected. Trying to reconnect...
  `;
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    escPressCount++;
    
    // Clear any existing timer
    if (skipTimer) clearTimeout(skipTimer);
    
    // Set timer to reset count after 1 second
    skipTimer = setTimeout(() => {
      escPressCount = 0;
    }, 1000);

    if (escPressCount === 1) {
      // First press - do nothing
      return;
    }

    if (escPressCount === 2) {
      // Second press - show confirmation
      const confirmation = confirm('Are you sure you want to exit? Press ESC again to confirm.');
      if (confirmation) {
        escPressCount = 3; // Skip to exit
      } else {
        escPressCount = 0; // Reset count
      }
    }

    if (escPressCount === 3) {
      // Third press - handle exit
      socket.emit('skip');
      alert('You have left the chat. Press ESC again to start a new chat.');
      escPressCount = 0;
      return;
    }

    if (escPressCount === 4) {
      // Fourth press - start new chat
      socket.emit('findPartner');
      escPressCount = 0;
    }
  }
});

// Handle skip confirmation
socket.on('skipConfirmed', () => {
  statusElement.innerHTML = `
    <span class="status-dot"></span>
    Chat ended. Press ESC to start a new chat.
  `;
  chatInput.disabled = true;
  sendBtn.disabled = true;
  
  // Clear chat messages
  chatMessages.innerHTML = `
    <div class="system-message">
      Chat ended. Press ESC to start a new chat.
    </div>
  `;
}); 