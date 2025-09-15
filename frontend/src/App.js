import './App.css';
import { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import ChatScreen from './components/ChatScreen';

function App() {
  const [username, setUsername] = useState('');
  const [currentPage, setCurrentPage] = useState('login'); // 'login' or 'chat'

  const handleLogin = (usernameValue) => {
    setUsername(usernameValue);
    setCurrentPage('chat');
  };

  const handleDisconnect = () => {
    setUsername('');
    setCurrentPage('login');
  };

  return (
    <div className="App">
      {currentPage === 'login' && (
        <LoginScreen onLogin={handleLogin} />
      )}

      {currentPage === 'chat' && (
        <ChatScreen username={username} />
      )}
    </div>
  );
}

export default App;