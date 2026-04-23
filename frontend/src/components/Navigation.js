import React, { useState } from 'react';

export const Navbar = ({ user, onLogout, navigate }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const onClickNav = (e, path) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <header>
      <nav>
        <div className="logo" onClick={(e) => onClickNav(e, '/')} style={{ cursor: 'pointer' }}>🏗️ ConstructConnect</div>
        <ul>
          <li><a href="#/" onClick={(e) => onClickNav(e, '/')}>Browse Projects</a></li>
          <li><a href="#/freelancers" onClick={(e) => onClickNav(e, '/freelancers')}>Find Freelancers</a></li>
          {user ? (
            <>
              <li><a href="#/chatbot" onClick={(e) => onClickNav(e, '/chatbot')}>🤖 AI Assistant</a></li>
              <li><a href="#/dashboard" onClick={(e) => onClickNav(e, '/dashboard')}>Dashboard</a></li>
              <li><a href="#/messages" onClick={(e) => onClickNav(e, '/messages')}>Messages</a></li>
              <li><a href="#/profile" onClick={(e) => onClickNav(e, '/profile')}>Profile</a></li>
              <li><button className="btn btn-secondary" onClick={onLogout}>Logout</button></li>
            </>
          ) : (
            <>
              <li><a href="#/login" onClick={(e) => onClickNav(e, '/login')} className="btn btn-primary">Login</a></li>
              <li><a href="#/register" onClick={(e) => onClickNav(e, '/register')} className="btn btn-secondary">Sign Up</a></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export const Footer = () => {
  return (
    <footer style={{
      background: '#333',
      color: 'white',
      padding: '40px 20px',
      textAlign: 'center',
      marginTop: '60px'
    }}>
      <div className="container">
        <p>&copy; 2024 FreelanceHub. All rights reserved.</p>
        <div style={{ marginTop: '20px' }}>
          <a href="#" style={{ color: 'white', margin: '0 10px', textDecoration: 'none' }}>Privacy</a>
          <a href="#" style={{ color: 'white', margin: '0 10px', textDecoration: 'none' }}>Terms</a>
          <a href="#" style={{ color: 'white', margin: '0 10px', textDecoration: 'none' }}>Contact</a>
        </div>
      </div>
    </footer>
  );
};
