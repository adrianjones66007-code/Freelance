import React, { useState } from 'react';

export const ReviewCard = ({ review }) => {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <img src={review.reviewer.profile.profileImage} alt={review.reviewer.name} className="profile-pic" />
        <div>
          <h4>{review.reviewer.name}</h4>
          <span className="rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
        </div>
      </div>
      <p>{review.comment}</p>
      <small style={{ color: '#999' }}>
        {new Date(review.createdAt).toLocaleDateString()}
      </small>
    </div>
  );
};

export const ReviewForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'rating' ? parseInt(value) : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ rating: 5, comment: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Rating</label>
        <select
          name="rating"
          value={formData.rating}
          onChange={handleChange}
        >
          <option value={5}>5 Stars ★★★★★</option>
          <option value={4}>4 Stars ★★★★☆</option>
          <option value={3}>3 Stars ★★★☆☆</option>
          <option value={2}>2 Stars ★★☆☆☆</option>
          <option value={1}>1 Star ★☆☆☆☆</option>
        </select>
      </div>

      <div className="form-group">
        <label>Comment</label>
        <textarea
          name="comment"
          value={formData.comment}
          onChange={handleChange}
          placeholder="Share your experience..."
        />
      </div>

      <button type="submit" className="btn btn-primary">
        Submit Review
      </button>
    </form>
  );
};

export const RatingDisplay = ({ rating, count }) => {
  return (
    <div>
      <span className="rating">
        {'★'.repeat(Math.floor(rating))}
        {rating % 1 !== 0 ? '½' : ''}
        {'☆'.repeat(5 - Math.ceil(rating))}
      </span>
      <p>({count} reviews)</p>
    </div>
  );
};
