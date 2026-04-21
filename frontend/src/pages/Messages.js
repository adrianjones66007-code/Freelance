import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MessageBox, ConversationList, StartConversation } from '../components/MessageComponents';

const Messages = () => {
  const { user, token } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [freelancers, setFreelancers] = useState([]);

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
      fetchFreelancers();
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('/api/messages/conversations/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const fetchFreelancers = async () => {
    try {
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter out current user
      const filtered = response.data.filter(f => f._id !== user.id);
      setFreelancers(filtered);
    } catch (error) {
      console.error('Error fetching freelancers:', error);
    }
  };

  const handleSelectConversation = async (conversation) => {
    const otherUserId = conversation._id;
    setSelectedConversation({
      _id: otherUserId,
      ...conversation.userDetails
    });
    setShowNewConversation(false);
    
    try {
      const response = await axios.get(`/api/messages/conversation/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
      
      // Mark messages as read
      await axios.put(
        `/api/messages/conversation/${otherUserId}/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleStartConversation = async (recipientId) => {
    const recipient = freelancers.find(f => f._id === recipientId);
    setSelectedConversation(recipient);
    setShowNewConversation(false);
    setMessages([]);
  };

  const handleSendMessage = async (message) => {
    if (!selectedConversation) return;

    try {
      const newMessage = await axios.post(
        '/api/messages',
        {
          receiver: selectedConversation._id,
          message
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessages([...messages, newMessage.data]);
      
      // Refresh conversations list
      await fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  if (loading) {
    return <div className="container"><p style={{ textAlign: 'center', padding: '40px' }}>Loading...</p></div>;
  }

  return (
    <div className="container" style={{ marginTop: '40px', marginBottom: '40px' }}>
      <h2>Messages</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', minHeight: '600px' }}>
        <div>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowNewConversation(true)}
            style={{ width: '100%', marginBottom: '20px' }}
          >
            + New Conversation
          </button>
          
          {showNewConversation ? (
            <StartConversation 
              freelancers={freelancers}
              currentUserId={user.id}
              onSelectFreelancer={handleStartConversation}
              onCancel={() => setShowNewConversation(false)}
            />
          ) : (
            <ConversationList
              conversations={conversations}
              onSelectConversation={handleSelectConversation}
              currentUserId={user.id}
            />
          )}
        </div>

        <div>
          {selectedConversation ? (
            <>
              <div style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '15px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {selectedConversation.profile?.profileImage && (
                    <img 
                      src={selectedConversation.profile.profileImage} 
                      alt={selectedConversation.name}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  )}
                  <div>
                    <h3 style={{ margin: 0 }}>{selectedConversation.name}</h3>
                    <p style={{ margin: 0, fontSize: '0.9em', color: '#999' }}>{selectedConversation.profile?.bio}</p>
                  </div>
                </div>
              </div>
              <MessageBox
                messages={messages}
                onSendMessage={handleSendMessage}
                currentUserId={user.id}
              />
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <p style={{ color: '#999', fontSize: '1.1em' }}>Select a conversation or start a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
