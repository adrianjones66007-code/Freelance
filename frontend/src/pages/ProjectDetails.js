import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BidCard, BidForm } from '../components/BidComponents';
import { ReviewForm, ReviewCard } from '../components/ReviewComponents';

const ProjectDetails = ({ projectId, navigate }) => {
  const { user, token } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`/api/projects/${projectId}`);
      setProject(response.data);

      if (response.data.assignedFreelancer) {
        const reviewResponse = await axios.get(`/api/reviews/user/${response.data.assignedFreelancer._id}`);
        setReviews(reviewResponse.data);
      }
    } catch (err) {
      setError('Error loading project');
    } finally {
      setLoading(false);
    }
  };

  const handleBidSubmit = async (bidData) => {
    try {
      await axios.post('/api/bids', bidData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setError('');
      alert('Bid submitted successfully!');
      fetchProject();
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting bid');
    }
  };

  const handleAcceptBid = async (bidId) => {
    try {
      await axios.put(`/api/bids/${bidId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProject();
    } catch (err) {
      setError('Error accepting bid');
    }
  };

  const handleRejectBid = async (bidId) => {
    try {
      await axios.put(`/api/bids/${bidId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProject();
    } catch (err) {
      setError('Error rejecting bid');
    }
  };

  if (loading) return <div className="container"><p style={{ textAlign: 'center', padding: '40px' }}>Loading...</p></div>;
  if (!project) return <div className="container"><p style={{ textAlign: 'center', padding: '40px' }}>Project not found</p></div>;

  return (
    <div className="container" style={{ marginTop: '40px' }}>
      <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: '20px' }}>
        ← Back to Projects
      </button>

      {error && <div className="error" style={{ marginBottom: '20px', color: '#e74c3c' }}>{error}</div>}

      <div className="card">
        <h1>{project.title}</h1>
        <p><strong>Status:</strong> <span className="badge">{project.status}</span></p>
        <p><strong>Budget:</strong> ${project.budget} ({project.budgetType})</p>
        <p><strong>Category:</strong> {project.category}</p>
        <p><strong>Posted by:</strong> {project.client.name}</p>

        {project.projectImages && project.projectImages.length > 0 && (
          <div style={{ marginTop: '20px', marginBottom: '20px' }}>
            <h3>Project Images</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              {project.projectImages.map((image, idx) => (
                <img
                  key={idx}
                  src={image}
                  alt={`Project ${idx + 1}`}
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '5px', cursor: 'pointer' }}
                  onClick={() => window.open(image, '_blank')}
                />
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: '20px' }}>
          <h3>Description</h3>
          <p>{project.description}</p>
        </div>

        {project.skills && project.skills.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3>Required Skills</h3>
            <div>
              {project.skills.map((skill, idx) => (
                <span key={idx} className="badge" style={{ marginRight: '5px' }}>{skill}</span>
              ))}
            </div>
          </div>
        )}

        {project.deadline && (
          <p><strong>Deadline:</strong> {new Date(project.deadline).toLocaleDateString()}</p>
        )}
      </div>

      <div style={{ display: 'flex', gap: '20px', margin: '30px 0', borderBottom: '2px solid #f0f0f0' }}>
        <button
          onClick={() => setActiveTab('details')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'details' ? '#667eea' : 'transparent',
            color: activeTab === 'details' ? 'white' : '#333',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          Bids
        </button>
        {project.assignedFreelancer && (
          <button
            onClick={() => setActiveTab('reviews')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'reviews' ? '#667eea' : 'transparent',
              color: activeTab === 'reviews' ? 'white' : '#333',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            Reviews
          </button>
        )}
      </div>

      {activeTab === 'details' && (
        <div>
          {user && (user.userType === 'freelancer' || user.userType === 'both') && project.status === 'open' && (
            <div className="card" style={{ marginBottom: '30px' }}>
              <h2>Submit Your Bid</h2>
              <BidForm projectId={projectId} onSubmit={handleBidSubmit} />
            </div>
          )}

          <h2>Bids ({project.bids?.length || 0})</h2>
          {project.bids && project.bids.length > 0 ? (
            project.bids.map(bid => (
              <BidCard
                key={bid._id}
                bid={bid}
                onAccept={handleAcceptBid}
                onReject={handleRejectBid}
                isClient={project.client._id === user?.id}
              />
            ))
          ) : (
            <p>No bids yet</p>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div>
          <h2>Reviews</h2>
          {reviews.length > 0 ? (
            reviews.map(review => (
              <ReviewCard key={review._id} review={review} />
            ))
          ) : (
            <p>No reviews yet</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
