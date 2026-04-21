import React, { useState } from 'react';

export const RatingDisplay = ({ rating, count }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '1.1em' }}>
        {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
      </span>
      <span style={{ color: '#666', fontSize: '0.9em' }}>
        {rating.toFixed(1)} ({count} {count === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  );
};

export const ReviewCard = ({ review, onDelete, isOwnProfile }) => {
  return (
    <div className="card" style={{ marginBottom: '15px', padding: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {review.reviewer?.profile?.profileImage && (
            <img 
              src={review.reviewer.profile.profileImage} 
              alt={review.reviewer.name}
              style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }}
            />
          )}
          <div>
            <h4 style={{ margin: '0 0 5px 0' }}>{review.reviewer.name}</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="rating" style={{ fontSize: '1em' }}>
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </span>
              <span style={{ color: '#999', fontSize: '0.85em' }}>
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        {isOwnProfile && onDelete && (
          <button 
            onClick={() => onDelete(review._id)}
            style={{
              background: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              padding: '5px 10px',
              cursor: 'pointer',
              fontSize: '0.85em'
            }}
          >
            Delete
          </button>
        )}
      </div>
      {review.comment && (
        <p style={{ margin: '10px 0', color: '#333', lineHeight: '1.5' }}>
          {review.comment}
        </p>
      )}
      {review.project?.title && (
        <small style={{ color: '#999' }}>
          Project: {review.project.title}
        </small>
      )}
    </div>
  );
};

export const ReviewForm = ({ onSubmit, isLoading }) => {
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
    if (!formData.comment.trim()) {
      alert('Please add a comment');
      return;
    }
    onSubmit(formData);
    setFormData({ rating: 5, comment: '' });
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0 }}>Leave a Review</h3>
      
      <div className="form-group">
        <label><strong>Rating</strong></label>
        <select
          name="rating"
          value={formData.rating}
          onChange={handleChange}
          style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ddd', width: '100%' }}
        >
          <option value={5}>5 Stars - Excellent! ★★★★★</option>
          <option value={4}>4 Stars - Very Good ★★★★☆</option>
          <option value={3}>3 Stars - Good ★★★☆☆</option>
          <option value={2}>2 Stars - Fair ★★☆☆☆</option>
          <option value={1}>1 Star - Poor ★☆☆☆☆</option>
        </select>
      </div>

      <div className="form-group">
        <label><strong>Comment</strong></label>
        <textarea
          name="comment"
          value={formData.comment}
          onChange={handleChange}
          placeholder="Share your experience working with this person..."
          rows="4"
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd', width: '100%', fontFamily: 'inherit' }}
        />
      </div>

      <button 
        type="submit" 
        className="btn btn-primary"
        disabled={isLoading}
      >
        {isLoading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export const RatingStars = ({ value, onChange, disabled }) => {
  const [hover, setHover] = useState(0);

  return (
    <div style={{ display: 'flex', gap: '5px', fontSize: '1.5em' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => !disabled && onChange(star)}
          onMouseEnter={() => !disabled && setHover(star)}
          onMouseLeave={() => setHover(0)}
          style={{
            cursor: disabled ? 'default' : 'pointer',
            color: star <= (hover || value) ? '#ffd700' : '#ddd',
            transition: 'color 0.2s',
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};
