import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ReviewCard, ReviewForm, RatingDisplay } from '../components/ReviewComponents';
import ImageModal from '../components/ImageModal';

const Profile = ({ userId, isOwnProfile, navigate }) => {
  const { user, token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [projects, setProjects] = useState([]);
  const [bids, setBids] = useState([]);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);

  const profileId = userId || user?.id;
  const viewingOwnProfile = isOwnProfile || profileId === user?.id;

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
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) {
      console.log('No files selected');
      return;
    }

    console.log('Starting upload process...');
    console.log('Files selected:', files.length);
    console.log('Profile ID:', profileId);
    console.log('Token exists:', !!token);
    console.log('User:', user);
    console.log('Is own profile:', viewingOwnProfile);

    if (!token) {
      alert('You must be logged in to upload photos');
      return;
    }

    if (!viewingOwnProfile) {
      alert('You can only upload photos to your own profile');
      return;
    }

    setUploading(true);

    try {
      // Upload files one by one
      for (const file of files) {
        console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);

        const formDataObj = new FormData();
        formDataObj.append('image', file);

        const response = await axios.post(`/api/users/${profileId}/gallery`, formDataObj, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Upload response:', response.data);

        // Update the profile state after each successful upload
        setProfile(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            gallery: response.data.gallery
          }
        }));
      }

      alert(`${files.length} photo${files.length > 1 ? 's' : ''} added to gallery successfully!`);
    } catch (error) {
      console.error('Error uploading image:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      alert(`Failed to upload photo: ${error.response?.data?.message || error.message}`);
    } finally {
      setUploading(false);
      // Reset the file input
      e.target.value = '';
    }
  };

  const handleGalleryDelete = async (index) => {
    if (!window.confirm('Delete this photo?')) return;

    try {
      const response = await axios.delete(`/api/users/${profileId}/gallery/${index}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(prev => ({
        ...prev,
        profile: { ...prev.profile, gallery: response.data.gallery }
      }));
      alert('Photo deleted');
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete photo');
    }
  };

  const handleSubmitReview = async (reviewData) => {
    if (profileId === user?.id) {
      alert('You cannot review yourself');
      return;
    }

    setReviewSubmitting(true);
    try {
      await axios.post('/api/reviews', {
        ...reviewData,
        reviewedUserId: profileId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReviews();
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    // Note: You'd need to add a delete endpoint in the backend
    console.log('Delete review:', reviewId);
  };

  if (loading) return <div className="container"><p style={{ textAlign: 'center', padding: '40px' }}>Loading...</p></div>;
  if (!profile) return <div className="container"><p style={{ textAlign: 'center', padding: '40px' }}>Profile not found</p></div>;

  return (
    <div className="container" style={{ marginTop: '40px', marginBottom: '40px' }}>
      <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: '20px' }}>
        ← Back
      </button>

      {/* Profile Header */}
      <div className="card" style={{ padding: '30px', marginBottom: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '40px', alignItems: 'start' }}>
          <div style={{ textAlign: 'center' }}>
            {profile.profile?.profileImage && (
              <img 
                src={profile.profile.profileImage} 
                alt={profile.name} 
                style={{ width: '150px', height: '150px', borderRadius: '50%', marginBottom: '20px', objectFit: 'cover' }} 
              />
            )}
            <h2 style={{ marginTop: 0 }}>{profile.name}</h2>
          </div>

          {editing ? (
            <form>
              <div className="form-group">
                <label><strong>Name</strong></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                />
              </div>

              <div className="form-group">
                <label><strong>Bio</strong></label>
                <textarea
                  name="profile.bio"
                  value={formData.profile?.bio || ''}
                  onChange={handleChange}
                  rows="3"
                  style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                />
              </div>

              <div className="form-group">
                <label><strong>Skills (comma-separated)</strong></label>
                <input
                  type="text"
                  name="profile.skills"
                  value={formData.profile?.skills?.join(', ') || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    profile: { ...prev.profile, skills: e.target.value.split(',').map(s => s.trim()) }
                  }))}
                  style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                />
              </div>

              <div className="form-group">
                <label><strong>Hourly Rate</strong></label>
                <input
                  type="number"
                  name="profile.hourlyRate"
                  value={formData.profile?.hourlyRate || ''}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn btn-primary" onClick={handleSave}>Save Changes</button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <div>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Type:</strong> {profile.userType}</p>
              {profile.profile?.bio && <p><strong>Bio:</strong> {profile.profile.bio}</p>}
              <p><strong>Hourly Rate:</strong> ${profile.profile?.hourlyRate || 'N/A'}/hr</p>
              <p><strong>Completed Projects:</strong> {profile.profile?.completedProjects || 0}</p>
              
              <div style={{ marginBottom: '20px' }}>
                <strong>Rating:</strong><br />
                <RatingDisplay rating={profile.averageRating} count={profile.totalReviews} />
              </div>

              {profile.profile?.skills && profile.profile.skills.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <strong>Skills:</strong>
                  <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {profile.profile.skills.map((skill, idx) => (
                      <span key={idx} className="badge">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                {viewingOwnProfile ? (
                  <button className="btn btn-primary" onClick={() => setEditing(true)}>
                    Edit Profile
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={() => navigate('/messages')}>
                    Message This User
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gallery Section */}
      {profile.profile && (
        <div className="card" style={{ marginBottom: '30px', padding: '30px' }}>
          <h2>Portfolio Gallery</h2>
          <p style={{ color: '#666', marginTop: '10px', marginBottom: '20px' }}>
            Showcase your completed work with photos. Upload images to your portfolio gallery so clients can review your experience.
          </p>

          {viewingOwnProfile && (
            <div style={{
              border: '2px dashed #667eea',
              borderRadius: '10px',
              padding: '30px',
              textAlign: 'center',
              marginBottom: '30px',
              background: uploading ? '#f8f9fa' : '#fafbff'
            }}>
              <div style={{ marginBottom: '15px' }}>
                <span style={{ fontSize: '3em' }}>📸</span>
              </div>
              <h3 style={{ margin: '10px 0', color: '#333' }}>
                {uploading ? 'Uploading Photo...' : 'Add Photos to Your Portfolio'}
              </h3>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                Upload high-quality images of your completed work to showcase your skills to potential clients.
              </p>
              <label
                className="btn btn-primary"
                style={{
                  cursor: uploading ? 'default' : 'pointer',
                  marginBottom: 0,
                  padding: '12px 24px',
                  fontSize: '16px'
                }}
              >
                {uploading ? 'Uploading...' : '📎 Choose Photos'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryUpload}
                  disabled={uploading}
                  multiple
                  style={{ display: 'none' }}
                />
              </label>
              <p style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>
                Supported formats: JPG, PNG, GIF, WebP (max 5MB each)
              </p>
            </div>
          )}

          {profile.profile?.gallery && profile.profile.gallery.length > 0 ? (
            <>
              <h3>Your Portfolio Photos ({profile.profile.gallery.length})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
                {profile.profile.gallery.map((image, idx) => (
                  <div key={idx} style={{
                    position: 'relative',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s'
                  }}>
                    <button
                      type="button"
                      onClick={() => setSelectedGalleryImage(image)}
                      style={{
                        padding: 0,
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        width: '100%',
                        height: '200px',
                        overflow: 'hidden'
                      }}
                    >
                      <img
                        src={image}
                        alt={`Portfolio ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                      />
                    </button>
                    {viewingOwnProfile && (
                      <button
                        onClick={() => handleGalleryDelete(idx)}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(255,0,0,0.8)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          cursor: 'pointer',
                          fontSize: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Delete photo"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <ImageModal src={selectedGalleryImage} alt="Portfolio photo" onClose={() => setSelectedGalleryImage(null)} />
            </>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#999',
              background: '#f8f9fa',
              borderRadius: '10px'
            }}>
              <span style={{ fontSize: '3em', marginBottom: '20px', display: 'block' }}>🖼️</span>
              <h3>{viewingOwnProfile ? 'No photos yet' : 'No portfolio photos available'}</h3>
              <p>{viewingOwnProfile ? 'Upload your first portfolio photo above to get started!' : 'This user hasn\'t added any portfolio photos yet.'}</p>
            </div>
          )}
        </div>
      )}

      {/* Review Section - Allow everyone to leave reviews for other users */}
      {!viewingOwnProfile && user && (
        <div className="card" style={{ marginBottom: '30px', padding: '30px' }}>
          <ReviewForm onSubmit={handleSubmitReview} isLoading={reviewSubmitting} />
        </div>
      )}

      {/* Reviews Display */}
      <div className="card" style={{ marginBottom: '30px', padding: '30px' }}>
        <h2>Reviews ({reviews.length})</h2>
        {reviews.length > 0 ? (
          <div>
            {reviews.map(review => (
              <ReviewCard 
                key={review._id} 
                review={review}
                isOwnProfile={viewingOwnProfile}
                onDelete={viewingOwnProfile ? handleDeleteReview : null}
              />
            ))}
          </div>
        ) : (
          <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>No reviews yet</p>
        )}
      </div>

      {/* Projects Section */}
      {viewingOwnProfile && (profile?.userType === 'client' || profile?.userType === 'both') && (
        <div className="card" style={{ marginBottom: '30px', padding: '30px' }}>
          <h2>Posted Projects ({projects.length})</h2>
          {projects.length > 0 ? (
            <div style={{ display: 'grid', gap: '15px' }}>
              {projects.map(project => (
                <div key={project._id} className="card" style={{ padding: '15px' }}>
                  <h3 style={{ marginTop: 0 }}>{project.title}</h3>
                  <p>{project.description.substring(0, 100)}...</p>
                  <p><strong>Budget:</strong> ${project.budget}</p>
                  <p><strong>Status:</strong> {project.status}</p>
                  <p><strong>Bids:</strong> {project.bids.length}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No projects posted yet.</p>
          )}
        </div>
      )}

      {/* Bids Section */}
      {viewingOwnProfile && (profile?.userType === 'freelancer' || profile?.userType === 'both') && (
        <div className="card" style={{ marginBottom: '30px', padding: '30px' }}>
          <h2>My Bids ({bids.length})</h2>
          {bids.length > 0 ? (
            <div style={{ display: 'grid', gap: '15px' }}>
              {bids.map(bid => (
                <div key={bid._id} className="card" style={{ padding: '15px' }}>
                  <h3 style={{ marginTop: 0 }}>{bid.project.title}</h3>
                  <p><strong>Bid Amount:</strong> ${bid.bidAmount}</p>
                  <p><strong>Status:</strong> {bid.status}</p>
                  <p><strong>Proposed Timeline:</strong> {bid.proposedTimeline}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No bids submitted yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
