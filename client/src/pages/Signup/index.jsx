import '../CommonStyles/loginSignup.css';
import './style.css';

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaLock, FaUserPlus, FaSpinner, FaCode, FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useAuthContext } from '../../context/AuthContext';
import { validatePassword } from '../../services/validatePassword';
import { showSuccessToast, showErrorToast } from '../../utils/toaster';
import { customErrorMessage } from '../../utils/error';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordError) {
      showErrorToast(passwordError);
      return;
    }
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await signup(username, password);
      showSuccessToast('Account created successfully!');
      navigate('/login', { replace: true });
    } catch (error) {
      showErrorToast(customErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordError(validatePassword(newPassword));
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
        <h1 className="auth-title">Join CodeGen</h1>
        <p className="auth-subtitle">Create your account and start building amazing applications</p>
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
                  placeholder="Choose a username"
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
                  onChange={handlePasswordChange}
                  className={`form-input ${passwordError ? 'error' : ''}`}
                  placeholder="Create a secure password"
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
              {passwordError && (
                <div className="password-error">
                  <FaTimesCircle className="error-icon" />
                  {passwordError}
                </div>
              )}
              {password && !passwordError && (
                <div className="password-success">
                  <FaCheckCircle className="success-icon" />
                  Password meets requirements
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="submit-section">
              <button 
                type="submit" 
                className={`submit-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading || !!passwordError}
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="spinner" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <FaUserPlus />
                    Create Account
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="divider-container">
            <div className="divider-line"></div>
            <div className="divider-text">
              <span>Already a member?</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="auth-footer">
            <p className="auth-footer-text">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
