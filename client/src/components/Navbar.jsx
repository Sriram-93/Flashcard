import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const linkStyle = {
    display: 'inline-block',
    margin: '0 10px',
    padding: '8px 16px',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#ff0000',   // red text
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
  };

  const hoverStyle = {
    backgroundColor: '#ff0000', // red background on hover
    color: 'white',
    transform: 'translateY(-2px) scale(1.05)',
  };

  const handleMouseEnter = (e) => {
    Object.assign(e.target.style, hoverStyle);
  };

  const handleMouseLeave = (e) => {
    Object.assign(e.target.style, linkStyle);
  };

  return (
    <nav style={{ backgroundColor: '#ff4d4d', padding: '10px' }}>
      <h2 style={{ display: 'inline-block', marginRight: '20px', color: 'white' }}>FlashMaster</h2>
      {[
        { to: '/', label: 'Home' },
        { to: '/signup', label: 'Signup' },
        { to: '/login', label: 'Login' },
        { to: '/input', label: 'Upload' },
        { to: '/review', label: 'Review Flashcards' },
        { to: '/qnspeak', label: 'Qn Speak' },
        { to: '/quiz', label: 'Quiz' },
      ].map((link) => (
        <Link
          key={link.to}
          to={link.to}
          style={linkStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
};

export default Navbar;
