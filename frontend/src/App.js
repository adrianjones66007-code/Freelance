import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Navbar, Footer } from './components/Navigation';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PostProject from './pages/PostProject';
import ProjectDetails from './pages/ProjectDetails';
import Profile from './pages/Profile';
import FreelancerList from './pages/FreelancerList';
import Messages from './pages/Messages';
import JobPostingChatbot from './components/JobPostingChatbot';

const AppContent = () => {
  const { user, logout, loading } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState({});
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    axios.defaults.baseURL = process.env.REACT_APP_API_URL || '';
  }, []);

  const syncFromHash = () => {
    const raw = window.location.hash.replace('#/', '');
    const parts = raw.split('/').filter(p => p);
    const page = parts[0] || 'home';
    const params = {};

    if (page === 'project' && parts[1]) {
      params.id = parts[1];
    }
    if (page === 'profile' && parts[1]) {
      params.id = parts[1];
    }

    setCurrentPage(page);
    setPageParams(params);
  };

  useEffect(() => {
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const navigate = (path, params = {}) => {
    window.scrollTo(0, 0);
    const parts = path.split('/').filter(p => p);
    const page = parts[0] || 'home';
    const nextParams = { ...params };

    if (page === 'project' && parts[1]) {
      nextParams.id = parts[1];
    }
    if (page === 'profile' && parts[1]) {
      nextParams.id = parts[1];
    }

    setCurrentPage(page);
    setPageParams(nextParams);
    window.location.hash = `#/${parts.join('/')}`;
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('home');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  let page;
  switch (currentPage) {
    case 'login':
      page = <Login navigate={navigate} />;
      break;
    case 'register':
      page = <Register navigate={navigate} />;
      break;
    case 'dashboard':
      page = user ? <Dashboard navigate={navigate} /> : <Login navigate={navigate} />;
      break;
    case 'post-project':
      page = user ? <PostProject navigate={navigate} /> : <Login navigate={navigate} />;
      break;
    case 'project':
      page = <ProjectDetails projectId={pageParams.id} navigate={navigate} />;
      break;
    case 'profile':
      page = <Profile userId={pageParams.id} isOwnProfile={!pageParams.id || pageParams.id === user?.id} navigate={navigate} />;
      break;
    case 'freelancers':
      page = <FreelancerList navigate={navigate} />;
      break;
    case 'messages':
      page = user ? <Messages /> : <Login navigate={navigate} />;
      break;
    default:
      page = <Home navigate={navigate} />;
  }

  return (
    <div className="app">
      <Navbar user={user} onLogout={handleLogout} navigate={navigate} />
      <div style={{ minHeight: 'calc(100vh - 200px)' }}>
        {page}
      </div>
      <Footer />
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1001 }}>
        {!showChatbot ? (
          <button
            className="btn btn-primary"
            onClick={() => setShowChatbot(true)}
            style={{ borderRadius: '50%', width: '60px', height: '60px', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Open Job Posting Assistant"
          >
            🤖
          </button>
        ) : null}
      </div>
      {showChatbot && <JobPostingChatbot onClose={() => setShowChatbot(false)} />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
