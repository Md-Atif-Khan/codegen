import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { showSuccessToast } from '../../utils/toaster';
import './style.css';

const Navbar = () => {
  const { user, logout } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    toast.info(
      <div className="logout-dialog">
        <p className="logout-text">Are you sure you want to logout?</p>
        <div className="logout-buttons">
          <button
            className="logout-confirm"
            onClick={async () => {
              const response = await logout();   
              showSuccessToast(response.message);
            }}
          >
            Yes, Logout
          </button>
          <button
            className="logout-cancel"
            onClick={() => toast.dismiss()}
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        closeButton: false,
        className: "toast-dialog"
      }
    );
  };

  const isHomePage = location.pathname === '/';
  const navbarClass = `navbar ${isHomePage ? 'navbar-transparent' : 'navbar-gradient'}`;

  return (
    <nav className={navbarClass}>
      <div className="navbar-container">
        <div className="navbar-content">
          <div className="navbar-brand">
            <Link to="/" className="brand-link">
              <span className="brand-text">CodeGen</span>
            </Link>
            <div className="nav-links">
              <div className="nav-links-container">
                {location.pathname !== '/' && (
                  <Link to="/" className="nav-link">Home</Link>
                )}
                {user && location.pathname !== '/dashboard' && (
                  <Link to="/dashboard" className="nav-link">Dashboard</Link>
                )}
              </div>
            </div>
          </div>
            <div className="auth-content">
              {user ? (
                <>
                  <span className="welcome-text">Welcome, {user.username}</span>
                  <button onClick={handleLogout} className="auth-button">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="auth-link">Login</Link>
                  <Link to="/signup" className="auth-link">Sign Up</Link>
                </>
              )}
            </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;