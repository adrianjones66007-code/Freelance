import React, { useState } from 'react';

export const MessageBox = ({ messages, onSendMessage, currentUserId }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '500px' }}>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '5px' }}>
        {messages.map((msg) => (
          <div key={msg._id} style={{
            marginBottom: '10px',
            textAlign: msg.sender === currentUserId ? 'right' : 'left'
          }}>
            <div style={{
              display: 'inline-block',
              maxWidth: '70%',
              padding: '10px',
              borderRadius: '5px',
              backgroundColor: msg.sender === currentUserId ? '#667eea' : '#f0f0f0',
              color: msg.sender === currentUserId ? 'white' : 'black'
            }}>
              {msg.message}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary">
          Send
        </button>
      </form>
    </div>
  );
};

export const ConversationList = ({ conversations, onSelectConversation }) => {
  return (
    <div>
      <h3>Conversations</h3>
      {conversations.map((conv) => (
        <div
          key={conv._id}
          className="card"
          onClick={() => onSelectConversation(conv)}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={conv.sender.profile.profileImage} alt={conv.sender.name} className="profile-pic" />
            <div>
              <h4>{conv.sender.name}</h4>
              <p>{conv.message.substring(0, 50)}...</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
