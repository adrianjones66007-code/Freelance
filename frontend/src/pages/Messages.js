import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MessageBox, ConversationList } from '../components/MessageComponents';

const Messages = () => {
  const { user, token } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`/api/messages/inbox/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Group messages by sender
      const grouped = response.data.reduce((acc, msg) => {
        const senderId = msg.sender._id;
        if (!acc[senderId] || new Date(msg.createdAt) > new Date(acc[senderId].createdAt)) {
          acc[senderId] = {
            _id: msg._id,
            sender: msg.sender,
            message: msg.message,
            createdAt: msg.createdAt
          };
        }
        return acc;
      }, {});
      const conversations = Object.values(grouped).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setConversations(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    try {
      const response = await axios.get(`/api/messages/conversation/${conversation.sender._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (message) => {
    try {
      const newMessage = await axios.post(
        '/api/messages',
        {
          receiver: selectedConversation.sender._id,
          message
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessages([...messages, newMessage.data]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return <div className="container"><p style={{ textAlign: 'center', padding: '40px' }}>Loading...</p></div>;
  }

  return (
    <div className="container" style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
      <div>
        <ConversationList
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      <div>
        {selectedConversation ? (
          <>
            <h3>{selectedConversation.sender.name}</h3>
            <MessageBox
              messages={messages}
              onSendMessage={handleSendMessage}
              currentUserId={user.id}
            />
          </>
        ) : (
          <p>Select a conversation to start messaging</p>
        )}
      </div>
    </div>
  );
};

export default Messages;
