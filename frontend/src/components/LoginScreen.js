import React, { useState } from 'react';
import './LoginScreen.css';

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const usernameValue = username.trim();

    if (usernameValue) {
      onLogin(usernameValue);
    }
  };

  return (
    <div id="username-page">
      <div className="username-page-container">
        <h1 className="title">Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoComplete="off"
              className="form-control"
              autoFocus
            />
          </div>
          <div className="form-group">
            <button type="submit" className="username-submit">
              Connect
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;