import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ReviewCard, ReviewForm } from '../components/ReviewComponents';

const Profile = ({ userId, isOwnProfile, navigate }) => {
  const { user, token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [projects, setProjects] = useState([]);
  const [bids, setBids] = useState([]);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  const profileId = userId || user?.id;

  useEffect(() => {
    if (profileId) {
      fetchProfile();
      fetchReviews();
    }
  }, [profileId]);

  useEffect(() => {
    if (profile) {
      if (profile.userType === 'client' || profile.userType === 'both') {
        fetchProjects();
      }
      if (profile.userType === 'freelancer' || profile.userType === 'both') {
        fetchBids();
      }
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`/api/users/${profileId}`);
      setProfile(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/api/reviews/user/${profileId}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userProjects = response.data.filter(p => p.client === profileId);
      setProjects(userProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchBids = async () => {
    try {
      const response = await axios.get(`/api/bids/freelancer/bids/${profileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBids(response.data);
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('profile.')) {
      const field = name.replace('profile.', '');
      setFormData(prev => ({
        ...prev,
        profile: { ...prev.profile, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(`/api/users/${profileId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(formData);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      await axios.post('/api/reviews', {
        ...reviewData,
        reviewedUserId: profileId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  if (loading) return <div className="container"><p style={{ textAlign: 'center', padding: '40px' }}>Loading...</p></div>;
  if (!profile) return <div className="container"><p style={{ textAlign: 'center', padding: '40px' }}>Profile not found</p></div>;

  return (
    <div className="container" style={{ marginTop: '40px' }}>
      <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: '20px' }}>
        ← Back
      </button>

      <div className="card" style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {profile.profile?.profileImage && (
            <img src={profile.profile.profileImage} alt={profile.name} style={{ width: '150px', borderRadius: '50%', marginBottom: '20px' }} />
          )}

          {editing ? (
            <form>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="profile.bio"
                  value={formData.profile?.bio || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Skills (comma-separated)</label>
                <input
                  type="text"
                  name="profile.skills"
                  value={formData.profile?.skills?.join(', ') || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    profile: { ...prev.profile, skills: e.target.value.split(',').map(s => s.trim()) }
                  }))}
                />
              </div>

              <div className="form-group">
                <label>Hourly Rate</label>
                <input
                  type="number"
                  name="profile.hourlyRate"
                  value={formData.profile?.hourlyRate || ''}
                  onChange={handleChange}
                />
              </div>

              <button type="button" className="btn btn-primary" onClick={handleSave}>Save Changes</button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </form>
          ) : (
            <>
              <h1>{profile.name}</h1>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Type:</strong> {profile.userType}</p>
              <p><strong>Bio:</strong> {profile.profile?.bio || 'No bio'}</p>
              <p><strong>Hourly Rate:</strong> ${profile.profile?.hourlyRate || 'N/A'}/hr</p>
              <p><strong>Completed Projects:</strong> {profile.profile?.completedProjects || 0}</p>
              <p><strong>Rating:</strong> ★ {profile.averageRating} ({profile.totalReviews} reviews)</p>

              {profile.profile?.skills && profile.profile.skills.length > 0 && (
                <div>
                  <strong>Skills:</strong>
                  <div>
                    {profile.profile.skills.map((skill, idx) => (
                      <span key={idx} className="badge">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {isOwnProfile && (
                <button className="btn btn-primary" onClick={() => setEditing(true)} style={{ marginTop: '20px' }}>
                  Edit Profile
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {isOwnProfile && (
        <div className="card" style={{ marginTop: '30px' }}>
          <h2>Write a Review</h2>
          <ReviewForm onSubmit={handleSubmitReview} />
        </div>
      )}

      <div className="card" style={{ marginTop: '30px' }}>
        <h2>Reviews ({reviews.length})</h2>
        {reviews.length > 0 ? (
          reviews.map(review => (
            <ReviewCard key={review._id} review={review} />
          ))
        ) : (
          <p>No reviews yet</p>
        )}
      </div>

      {isOwnProfile && (profile?.userType === 'client' || profile?.userType === 'both') && (
        <div className="card" style={{ marginTop: '30px' }}>
          <h2>Posted Projects ({projects.length})</h2>
          {projects.length > 0 ? (
            projects.map(project => (
              <div key={project._id} className="card" style={{ marginBottom: '10px' }}>
                <h3>{project.title}</h3>
                <p>{project.description.substring(0, 100)}...</p>
                <p><strong>Budget:</strong> ${project.budget}</p>
                <p><strong>Status:</strong> {project.status}</p>
                <p><strong>Bids:</strong> {project.bids.length}</p>
              </div>
            ))
          ) : (
            <p>No projects posted yet.</p>
          )}
        </div>
      )}

      {isOwnProfile && (profile?.userType === 'freelancer' || profile?.userType === 'both') && (
        <div className="card" style={{ marginTop: '30px' }}>
          <h2>My Bids ({bids.length})</h2>
          {bids.length > 0 ? (
            bids.map(bid => (
              <div key={bid._id} className="card" style={{ marginBottom: '10px' }}>
                <h3>{bid.project.title}</h3>
                <p><strong>Bid Amount:</strong> ${bid.bidAmount}</p>
                <p><strong>Status:</strong> {bid.status}</p>
                <p><strong>Proposed Timeline:</strong> {bid.proposedTimeline}</p>
              </div>
            ))
          ) : (
            <p>No bids submitted yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
