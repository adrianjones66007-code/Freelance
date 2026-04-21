import React, { useState } from 'react';

export const MessageBox = ({ messages, onSendMessage, currentUserId }) => {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && !sending) {
      setSending(true);
      try {
        await onSendMessage(newMessage);
        setNewMessage('');
      } finally {
        setSending(false);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '500px', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '15px', backgroundColor: '#f9f9f9' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', paddingTop: '40px' }}>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg._id} 
              style={{
                marginBottom: '15px',
                display: 'flex',
                justifyContent: msg.sender._id === currentUserId ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                display: 'inline-block',
                maxWidth: '70%',
                padding: '10px 15px',
                borderRadius: '8px',
                backgroundColor: msg.sender._id === currentUserId ? '#667eea' : '#e0e0e0',
                color: msg.sender._id === currentUserId ? 'white' : 'black',
                wordWrap: 'break-word'
              }}>
                <p style={{ margin: 0, marginBottom: '5px' }}>{msg.message}</p>
                <small style={{ opacity: 0.7, fontSize: '0.8em' }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </small>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', padding: '15px', borderTop: '1px solid #e0e0e0', backgroundColor: 'white' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, padding: '10px 12px', border: '1px solid #ddd', borderRadius: '5px' }}
          disabled={sending}
        />
        <button type="submit" className="btn btn-primary" disabled={sending || !newMessage.trim()}>
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export const ConversationList = ({ conversations, onSelectConversation, currentUserId }) => {
  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
      <h3 style={{ padding: '15px', margin: 0, borderBottom: '1px solid #f0f0f0', backgroundColor: '#f9f9f9' }}>
        Conversations ({conversations.length})
      </h3>
      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {conversations.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
            <p>No conversations yet.</p>
            <p>Start messaging with someone!</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv._id}
              onClick={() => onSelectConversation(conv)}
              style={{
                padding: '12px 15px',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                backgroundColor: 'white'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              {conv.userDetails.profile?.profileImage && (
                <img 
                  src={conv.userDetails.profile.profileImage} 
                  alt={conv.userDetails.name}
                  style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '0.95em' }}>{conv.userDetails.name}</h4>
                <p style={{ margin: 0, fontSize: '0.85em', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {conv.lastMessage.message.substring(0, 40)}...
                </p>
                <small style={{ color: '#999', fontSize: '0.8em' }}>
                  {getTimeAgo(new Date(conv.lastMessage.createdAt))}
                </small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const StartConversation = ({ freelancers, currentUserId, onSelectFreelancer, onCancel }) => {
  const [search, setSearch] = useState('');

  const filtered = freelancers.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    (f.profile?.bio && f.profile.bio.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ padding: '15px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#f9f9f9' }}>
        <input
          type="text"
          placeholder="Search by name or skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
            <p>No freelancers found</p>
          </div>
        ) : (
          filtered.map((freelancer) => (
            <div
              key={freelancer._id}
              onClick={() => onSelectFreelancer(freelancer._id)}
              style={{
                padding: '12px 15px',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                backgroundColor: 'white'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              {freelancer.profile?.profileImage && (
                <img 
                  src={freelancer.profile.profileImage} 
                  alt={freelancer.name}
                  style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }}
                />
              )}
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 3px 0', fontSize: '0.95em' }}>{freelancer.name}</h4>
                <p style={{ margin: 0, fontSize: '0.85em', color: '#666' }}>
                  {freelancer.profile?.bio?.substring(0, 40)}...
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectFreelancer(freelancer._id);
                }}
                style={{ padding: '5px 10px', fontSize: '0.85em' }}
              >
                Message
              </button>
            </div>
          ))
        )}
      </div>
      <div style={{ padding: '15px', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
        <button className="btn btn-secondary" onClick={onCancel}>Back</button>
      </div>
    </div>
  );
};

// Helper function to format time
function getTimeAgo(date) {
  const now = new Date();
  const secondsAgo = Math.floor((now - date) / 1000);
  
  if (secondsAgo < 60) return 'Just now';
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
  if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)}d ago`;
  return date.toLocaleDateString();
}
