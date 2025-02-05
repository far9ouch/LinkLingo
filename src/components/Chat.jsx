import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

function Chat({ username }) {
  const socket = useSocket();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('connecting');
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [roomId, setRoomId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }

    socket.emit('join', { username });

    socket.on('joined', () => {
      setStatus('looking');
      socket.emit('findPartner');
    });

    socket.on('waiting', () => {
      setStatus('waiting');
    });

    socket.on('chatStarted', ({ roomId, users }) => {
      setStatus('connected');
      setRoomId(roomId);
      setMessages([{
        type: 'system',
        text: `Connected with ${users.find(u => u.username !== username).username}`
      }]);
    });

    socket.on('message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('partnerLeft', () => {
      setMessages(prev => [...prev, {
        type: 'system',
        text: 'Partner has left the chat'
      }]);
      setStatus('looking');
      setRoomId(null);
      socket.emit('findPartner');
    });

    socket.on('onlineUsers', (count) => {
      setOnlineUsers(count);
    });

    return () => {
      socket.off('joined');
      socket.off('waiting');
      socket.off('chatStarted');
      socket.off('message');
      socket.off('partnerLeft');
      socket.off('onlineUsers');
    };
  }, [socket, username, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !roomId) return;

    socket.emit('message', { roomId, text: input });
    setInput('');
  };

  const skipChat = () => {
    socket.emit('skip');
    setStatus('looking');
    setRoomId(null);
    socket.emit('findPartner');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="logo">LinkLingo</div>
        <div className="online-count">{onlineUsers} online</div>
        <div className="status">
          <span className={`status-dot ${status}`} />
          {status === 'connected' ? 'Connected with stranger' : 'Looking for stranger...'}
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${
              msg.type === 'system' 
                ? 'system' 
                : msg.username === username ? 'sent' : 'received'
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={status !== 'connected'}
        />
        <button 
          type="button" 
          onClick={skipChat}
          disabled={status !== 'connected'}
        >
          Skip
        </button>
        <button 
          type="submit" 
          disabled={status !== 'connected' || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat; 