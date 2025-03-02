import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../styles/Message.css';

const Message = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const userId = localStorage.getItem("userId"); // Assuming userId is stored

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token || !userId) {
          console.error("No token or userId found, user might not be authenticated.");
          return;
        }

        // Fetch messages for the specific userId
        const response = await axios.get(`http://localhost:5000/api/users/messages/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMessages(response.data.messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [userId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setIsSending(true);
      const token = localStorage.getItem("token");

      if (!token || !userId) {
        console.error("No token or userId found, unable to send message.");
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/users/messages',
        { userId, message: newMessage }, // Include userId
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages([...messages, response.data.message]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="message-container">
      <div className="message-card">
        <h2 className="message-title">Chat Room</h2>

        {/* Scrollable Message List */}
        <div className="message-list">
          {messages.length > 0 ? (
            messages.map((message) => {
              const isOwnMessage = message.senderId === userId;
              return (
                <div key={message._id} className={`message-item ${isOwnMessage ? 'own-message' : ''}`}>
                  
                  {/* Sender's Name & Online Status */}
                  {!isOwnMessage && (
                    <div className="message-header">
                      <span className="message-from">{message.from}</span>
                      <span className="online-status">
                        <span className="online-icon"></span> Online
                      </span>
                    </div>
                  )}

                  {/* Message Content (Left-aligned under the sender's name) */}
                  <div className="message-bubble">
                    <p className="message-text">{message.message}</p>
                  </div>

                  {/* Timestamp (Aligned under the message) */}
                  <div className="message-footer">
                    <span className="message-time">
                      {message.date
                        ? new Date(message.date).toLocaleString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                            month: 'short',
                            day: 'numeric'
                          })
                        : 'No time available'}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No messages found.</p>
          )}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Message Input (Fixed at Bottom) */}
        <div className="message-input-area">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
          ></textarea>
          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={isSending}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Message;
