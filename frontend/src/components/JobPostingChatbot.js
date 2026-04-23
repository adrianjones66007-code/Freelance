import React from 'react';

const JobPostingChatbot = () => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '300px',
      height: '400px',
      backgroundColor: '#fff',
      border: '1px solid #ccc',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#667eea',
        color: 'white',
        padding: '10px',
        borderRadius: '8px 8px 0 0'
      }}>
        <h4 style={{ margin: 0 }}>Job Posting Assistant</h4>
      </div>
      <div style={{ padding: '15px', height: '320px', overflowY: 'auto' }}>
        <p>Hi! I'm here to help you create better job postings.</p>
        <p>Ask me anything about writing effective job descriptions!</p>
      </div>
      <div style={{
        borderTop: '1px solid #eee',
        padding: '10px',
        backgroundColor: '#f9f9f9',
        borderRadius: '0 0 8px 8px'
      }}>
        <input
          type="text"
          placeholder="Ask me about job postings..."
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxSizing: 'border-box'
          }}
        />
      </div>
    </div>
  );
};

export default JobPostingChatbot;