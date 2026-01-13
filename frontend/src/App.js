import './App.css';
import {useState} from 'react';
import {AuthProvider, useAuth} from './context/AuthContext';
import LoginScreen from './components/LoginScreen';
import ChatScreen from './components/ChatScreen';

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('login'); // 'login' or 'register' or 'chat'

  // Auto-navigate to chat if authenticated
  if (isAuthenticated && currentPage === 'login') {
    setCurrentPage('chat');
  }

  const handleLoginSuccess = () => {
    setCurrentPage('chat');
  };

  const handleDisconnect = () => {
    setCurrentPage('login');
  };

  const handleSwitchToRegister = () => {
    setCurrentPage('register');
  };

  const handleSwitchToLogin = () => {
    setCurrentPage('login');
  };

  return (
      <div className="App">
        {(currentPage === 'login' || currentPage === 'register') && (
            <LoginScreen
                onLoginSuccess={handleLoginSuccess}
                isRegisterMode={currentPage === 'register'}
                onSwitchToRegister={handleSwitchToRegister}
                onSwitchToLogin={handleSwitchToLogin}
            />
        )}

        {currentPage === 'chat' && isAuthenticated && (
            <ChatScreen
                username={user.username}
                onDisconnect={handleDisconnect}
            />
        )}
      </div>
  );
}

function App() {
  return (
      <AuthProvider>
        <AppContent />
      </AuthProvider>
  );
}

export default App;