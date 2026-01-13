import React, {useState} from 'react';
import {useAuth} from '../context/AuthContext';
import './LoginScreen.css';

function LoginScreen({ onLoginSuccess, isRegisterMode, onSwitchToRegister, onSwitchToLogin }) {
  const { login, register } = useAuth();

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(loginEmail, loginPassword);

    if (result.success) {
      onLoginSuccess();
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (registerPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (registerPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    const result = await register(registerUsername, registerEmail, registerPassword);

    if (result.success) {
      onLoginSuccess();
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  if (isRegisterMode) {
    return (
        <div className="login-container">
          <div className="login-box">
            <h1>Create Account</h1>
            <p className="login-subtitle">Join MessagesVS today</p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input
                    type="text"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    placeholder="Choose a username"
                    required
                    disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    disabled={loading}
                />
              </div>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <p className="login-footer">
              Already have an account?{' '}
              <button
                  onClick={onSwitchToLogin}
                  className="link-button"
                  disabled={loading}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
    );
  }

  return (
      <div className="login-container">
        <div className="login-box">
          <h1>Welcome Back</h1>
          <p className="login-subtitle">Sign in to continue to MessagesVS</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="alice@example.com"
                  required
                  disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="login-footer">
            Don't have an account?{' '}
            <button
                onClick={onSwitchToRegister}
                className="link-button"
                disabled={loading}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
  );
}

export default LoginScreen;