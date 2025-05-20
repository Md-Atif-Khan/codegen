import '../CommonStyles/loginSignup.css';
import './style.css';

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { validatePassword } from '../../services/validatePassword';
import { showSuccessToast } from '../../utils/toaster';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { signup } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordError) {
      showErrorToast(passwordError);
      return;
    }
    try {
      const response = await signup(username, password);
      showSuccessToast('Signup successful!');
      navigate('/login', { replace: true });
    } catch (error) {
      showErrorToast(customErrorMessage(error));
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordError(validatePassword(newPassword));
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2 className="auth-title">Create your account</h2>
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
                onChange={handlePasswordChange}
                className="form-input"
                required
              />
              {passwordError && <p className="password-error">{passwordError}</p>}
            </div>
            <div>
              <button type="submit" className="submit-button" disabled={!!passwordError}>
                Sign Up
              </button>
            </div>
          </form>
          <div className="divider-container">
            <div className="divider-line"></div>
            <div className="divider-text">
              <span>Or</span>
            </div>
          </div>
          <div className="login-container">
            <p className="login-text">
              Already have an account?{' '}
              <Link to="/login" className="login-link">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
