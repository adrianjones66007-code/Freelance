import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ProjectCard } from '../components/ProjectComponents';

const Dashboard = ({ navigate }) => {
  const { user } = useContext(AuthContext);
  const [userProjects, setUserProjects] = useState([]);
  const [userBids, setUserBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(user?.userType === 'client' ? 'projects' : 'bids');

  useEffect(() => {
    if (user?.userType === 'client' || user?.userType === 'both') {
      fetchProjects();
    }
    if (user?.userType === 'freelancer' || user?.userType === 'both') {
      fetchBids();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const clientProjects = response.data.filter(p => p.client === user?.id);
      setUserProjects(clientProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      const response = await axios.get(`/api/bids/freelancer/bids/${user?.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUserBids(response.data);
    } catch (error) {
      console.error('Error fetching bids:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container"><p style={{ textAlign: 'center', padding: '40px' }}>Loading...</p></div>;
  }

  return (
    <div className="container">
      <div style={{ marginTop: '40px' }}>
        <h1>Dashboard</h1>
        <p>Welcome, {user?.name}!</p>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '2px solid #f0f0f0' }}>
          {(user?.userType === 'client' || user?.userType === 'both') && (
            <button
              onClick={() => setActiveTab('projects')}
              style={{
                padding: '10px 20px',
                background: activeTab === 'projects' ? '#667eea' : 'transparent',
                color: activeTab === 'projects' ? 'white' : '#333',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              My Projects
            </button>
          )}
          {(user?.userType === 'freelancer' || user?.userType === 'both') && (
            <button
              onClick={() => setActiveTab('bids')}
              style={{
                padding: '10px 20px',
                background: activeTab === 'bids' ? '#667eea' : 'transparent',
                color: activeTab === 'bids' ? 'white' : '#333',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              My Bids
            </button>
          )}
        </div>

        {activeTab === 'projects' && (
          <div>
            <button className="btn btn-primary" onClick={() => navigate('/post-project')} style={{ marginBottom: '20px' }}>
              Post New Project
            </button>
            {userProjects.length === 0 ? (
              <p>No projects yet. <a href="/post-project">Post your first project</a></p>
            ) : (
              <div className="grid">
                {userProjects.map(project => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    onViewDetails={(projectId) => navigate(`/project/${projectId}`)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bids' && (
          <div>
            {userBids.length === 0 ? (
              <p>No bids yet. <a href="/">Browse projects</a></p>
            ) : (
              <div className="grid">
                {userBids.map(bid => (
                  <div key={bid._id} className="card">
                    <h4>{bid.project.title}</h4>
                    <p><strong>Your Bid:</strong> ${bid.bidAmount}</p>
                    <p><strong>Status:</strong> <span className="badge">{bid.status}</span></p>
                    <p><strong>Timeline:</strong> {bid.proposedTimeline}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
