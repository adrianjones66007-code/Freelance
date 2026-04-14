import React, { useState } from 'react';

export const BidCard = ({ bid, onAccept, onReject, isClient }) => {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4>{bid.freelancer.name}</h4>
          <p><strong>Bid Amount:</strong> ${bid.bidAmount}</p>
          <p><strong>Timeline:</strong> {bid.proposedTimeline}</p>
          <p><strong>Rating:</strong> <span className="rating">★ {bid.freelancer.averageRating}</span></p>
          <p><strong>Message:</strong> {bid.coverLetter}</p>
          <p><strong>Status:</strong> <span className="badge">{bid.status}</span></p>
        </div>
        {isClient && bid.status === 'pending' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" onClick={() => onAccept(bid._id)}>
              Accept
            </button>
            <button className="btn btn-secondary" onClick={() => onReject(bid._id)}>
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const BidForm = ({ projectId, onSubmit }) => {
  const [formData, setFormData] = useState({
    bidAmount: '',
    proposedTimeline: '',
    coverLetter: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, projectId });
    setFormData({ bidAmount: '', proposedTimeline: '', coverLetter: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Your Bid Amount ($)</label>
        <input
          type="number"
          name="bidAmount"
          value={formData.bidAmount}
          onChange={handleChange}
          required
          placeholder="Enter your bid"
        />
      </div>

      <div className="form-group">
        <label>Proposed Timeline</label>
        <input
          type="text"
          name="proposedTimeline"
          value={formData.proposedTimeline}
          onChange={handleChange}
          placeholder="e.g., 2 weeks, 10 days"
        />
      </div>

      <div className="form-group">
        <label>Cover Letter</label>
        <textarea
          name="coverLetter"
          value={formData.coverLetter}
          onChange={handleChange}
          required
          placeholder="Tell the client why you're the best fit for this project"
        />
      </div>

      <button type="submit" className="btn btn-primary">
        Submit Bid
      </button>
    </form>
  );
};
