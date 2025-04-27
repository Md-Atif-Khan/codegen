import React, { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { showSuccessToast, showErrorToast } from '../../utils/toaster';
import { customErrorMessage } from '../../utils/error';
import '../commonStyles/loginSignup.css';
import './style.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(username, password);
      showSuccessToast("Login successful!");
      navigate('/dashboard', { replace: true });
    } catch (error) {
      showErrorToast(customErrorMessage(error));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2 className="auth-title">Login to your account</h2>
      </div>
      <div className="auth-form-container">
        <div className="auth-form-box">
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div>
              <button type="submit" className="submit-button">
                Login
              </button>
            </div>
          </form>
          <div className="divider-container">
            <div className="divider-line"></div>
            <div className="divider-text">
              <span>Or</span>
            </div>
          </div>
          <div className="signup-container">
            <p className="signup-text">
              Don't have an account?{' '}
              <Link to="/signup" className="signup-link">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
