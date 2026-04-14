import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RatingDisplay } from '../components/ReviewComponents';

const FreelancerList = ({ navigate }) => {
  const [freelancers, setFreelancers] = useState([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState('');

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const fetchFreelancers = async () => {
    try {
      const response = await axios.get('/api/users');
      setFreelancers(response.data);
      setFilteredFreelancers(response.data);
    } catch (error) {
      console.error('Error fetching freelancers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    const filtered = freelancers.filter(fl => {
      if (!skills) return true;
      return fl.profile.skills.some(skill =>
        skill.toLowerCase().includes(skills.toLowerCase())
      );
    });
    setFilteredFreelancers(filtered);
  };

  if (loading) {
    return <div className="container"><p style={{ textAlign: 'center', padding: '40px' }}>Loading...</p></div>;
  }

  return (
    <div>
      <section className="hero container">
        <h1>Find Top Freelancers</h1>
        <p>Browse and hire talented professionals for your projects</p>
      </section>

      <div className="container">
        <form onSubmit={handleFilter} style={{ background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
          <div className="form-group">
            <label>Search by Skills</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, Design, Writing..."
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </div>
          </div>
        </form>

        <h2>Top Freelancers ({filteredFreelancers.length})</h2>
        <div className="grid">
          {filteredFreelancers.map(freelancer => (
            <div key={freelancer._id} className="card">
              {freelancer.profile.profileImage && (
                <img src={freelancer.profile.profileImage} alt={freelancer.name} className="profile-pic" style={{ marginBottom: '10px' }} />
              )}
              <h3>{freelancer.name}</h3>
              <p>{freelancer.profile.bio}</p>

              {freelancer.profile.skills && (
                <div style={{ marginBottom: '10px' }}>
                  {freelancer.profile.skills.map((skill, idx) => (
                    <span key={idx} className="badge">{skill}</span>
                  ))}
                </div>
              )}

              <p><strong>Hourly Rate:</strong> ${freelancer.profile.hourlyRate || 'N/A'}/hr</p>
              <RatingDisplay
                rating={freelancer.averageRating}
                count={freelancer.totalReviews}
              />

              <button className="btn btn-primary" onClick={() => navigate(`/profile/${freelancer._id}`)}>
                View Profile
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FreelancerList;
