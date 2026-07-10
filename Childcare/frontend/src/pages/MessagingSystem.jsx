// src/pages/MessagingSystem.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './MessagingSystem.css';

const MessagingSystem = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'Sarah - Caretaker',
      avatar: '👩‍🏫',
      lastMessage: 'Mily had a great day today!',
      time: '2 mins ago',
      unread: 2
    },
    {
      id: 2,
      name: 'Admin Office',
      avatar: '🏢',
      lastMessage: 'Payment confirmation received',
      time: '1 hour ago',
      unread: 0
    },
    {
      id: 3,
      name: 'Emma\'s Parent',
      avatar: '👨‍👩‍👧',
      lastMessage: 'Thank you for the update!',
      time: '3 hours ago',
      unread: 0
    }
  ];

  const messages = {
    1: [
      {
        id: 1,
        sender: 'caretaker',
        text: 'Good morning! Mily arrived safely.',
        time: '8:30 AM',
        avatar: '👩‍🏫'
      },
      {
        id: 2,
        sender: 'me',
        text: 'Thank you for letting me know!',
        time: '8:32 AM',
        avatar: '👤'
      },
      {
        id: 3,
        sender: 'caretaker',
        text: 'Mily had a great day today! She painted a beautiful picture.',
        time: '2 mins ago',
        avatar: '👩‍🏫'
      }
    ]
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="messaging-system">
      <div className="messaging-header">
        <div className="header-content">
          <h1>💬 Messages</h1>
          <p>Chat with caretakers and parents</p>
        </div>
      </div>

      <div className="messaging-container">
        {/* Conversations List */}
        <div className="conversations-list">
          <h3 style={{ marginBottom: '1rem' }}>Conversations</h3>
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
              onClick={() => setSelectedConversation(conv)}
            >
              <div className="conversation-avatar">{conv.avatar}</div>
              <div className="conversation-info">
                <div className="conversation-name">{conv.name}</div>
                <div className="conversation-last-message">{conv.lastMessage}</div>
              </div>
              <div className="conversation-time">{conv.time}</div>
            </div>
          ))}
        </div>

        {/* Chat Window */}
        <div className="chat-window">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <div className="conversation-avatar">{selectedConversation.avatar}</div>
                <div>
                  <div className="conversation-name">{selectedConversation.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Online</div>
                </div>
              </div>

              <div className="chat-messages">
                {(messages[selectedConversation.id] || []).map(msg => (
                  <div key={msg.id} className={`message ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                    <div className="message-avatar">{msg.avatar}</div>
                    <div className="message-content">
                      <div className="message-bubble">{msg.text}</div>
                      <div className="message-time">{msg.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="chat-input">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="send-btn" onClick={handleSendMessage}>
                  Send
                </button>
              </div>
            </>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: '#9ca3af'
            }}>
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingSystem;