import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Chat from './components/Chat';
import { SocketProvider } from './context/SocketContext';

function App() {
  const [username, setUsername] = useState('');

  return (
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home setUsername={setUsername} />} />
          <Route path="/chat" element={<Chat username={username} />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App; 