import React, { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaLock, FaSignInAlt, FaSpinner, FaCode, FaEye, FaEyeSlash } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../../utils/toaster';
import { customErrorMessage } from '../../utils/error';
import '../CommonStyles/loginSignup.css';
import './style.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await login(username, password);
      showSuccessToast("Login successful!");
      navigate('/dashboard', { replace: true });
    } catch (error) {
      showErrorToast(customErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Background Elements */}
      <div className="auth-background-pattern"></div>
      <div className="auth-background-glow"></div>
      
      {/* Header Section */}
      <div className="auth-header">
        <div className="auth-icon">
          <FaCode />
        </div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your account and continue your coding journey</p>
      </div>

      {/* Form Container */}
      <div className="auth-form-container">
        <div className="auth-form-box">
          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                <FaUser className="label-icon" />
                Username
              </label>
              <div className="input-wrapper">
                {/* <div className="input-icon">
                  <FaUser />
                </div> */}
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <FaLock className="label-icon" />
                Password
              </label>
              <div className="input-wrapper">
                {/* <div className="input-icon">
                  <FaLock />
                </div> */}
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="submit-section">
              <button 
                type="submit" 
                className={`submit-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="spinner" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <FaSignInAlt />
                    Sign In
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="divider-container">
            <div className="divider-line"></div>
            <div className="divider-text">
              <span>New to CodeGen?</span>
            </div>
          </div>

          {/* Signup Link */}
          <div className="auth-footer">
            <p className="auth-footer-text">
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
