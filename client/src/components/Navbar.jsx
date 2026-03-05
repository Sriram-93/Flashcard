import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sun, 
  Moon, 
  LogIn, 
  UserPlus, 
  LogOut, 
  Zap, 
  BookOpen, 
  Mic, 
  Layout, 
  Home,
  BrainCircuit
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const appLinks = [
    { to: '/input', label: 'Generate', icon: <Zap size={18} /> },
    { to: '/review', label: 'Review', icon: <BookOpen size={18} /> },
    { to: '/qnspeak', label: 'Speak', icon: <Mic size={18} /> },
    { to: '/quiz', label: 'Quiz', icon: <Layout size={18} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass-navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <BrainCircuit className="brand-icon" size={24} />
          <span>Flashcard<span className="brand-highlight">AI</span></span>
        </Link>
        
        <div className="navbar-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <Home size={18} />
            <span>Home</span>
          </Link>
          {isAuthenticated && appLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          {isAuthenticated ? (
            <div className="user-profile">
              <span className="nav-user-name">{user?.name || 'User'}</span>
              <button onClick={handleLogout} className="btn-logout" aria-label="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className={`nav-btn-login ${location.pathname === '/login' ? 'active' : ''}`}>
                <LogIn size={18} />
                <span>Log In</span>
              </Link>
              <Link to="/signup" className="btn btn-primary nav-btn-signup">
                <UserPlus size={18} />
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

