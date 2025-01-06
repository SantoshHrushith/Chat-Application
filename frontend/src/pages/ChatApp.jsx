import React, { useEffect, useState,useRef } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import io from 'socket.io-client';

const socket = io("http://localhost:5001");

const ChatApp = () => {
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [sendmsg, setSendmsg] = useState('');
  const [selectedConv, setSelectedConv] = useState('');

  const messagesEndRef = useRef(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserId(decodedToken.id);
        socket.emit("join", decodedToken.id); // Join the socket room
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }
  }, []);

  // Fetch users to display on the left side
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/user/users/${userId}`);
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      alert("Failed to fetch users.");
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUsers();
    }
  }, [userId]);

  // Fetch messages between sender and receiver when userId or selectedUserId changes
  const fetchMessages = async () => {
    try {
      if (userId && selectedUserId) {
        const res = await axios.get(`http://localhost:5001/message/${selectedUserId}?senderId=${userId}`);
        setMessages(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      alert("Failed to fetch messages.");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [userId, selectedUserId]);

  // Listen for new messages from the server
  useEffect(() => {
    socket.on("newMessage", (newMessage) => {
      // Check if the message belongs to the current conversation
      if (
        (newMessage.senderId === userId && newMessage.receiverId === selectedUserId) ||
        (newMessage.senderId === selectedUserId && newMessage.receiverId === userId)
      ) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    return () => {
      socket.off("newMessage"); // Clean up the event listener on unmount
    };
  }, [userId, selectedUserId]);

  const handleUserClick = (userId, username) => {
    setSelectedUserId(userId);
    setSelectedConv(username);
    setMessages([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sendmsg.trim()) return;

    try {
      await axios.post(`http://localhost:5001/message/send/${selectedUserId}`, {
        message: sendmsg,
        userid: userId,
      });
      setSendmsg(''); // Clear the input after sending
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message.");
    }
  };

  return (
    <div className="chat-container">
          <div className="user-list">
            <table>
              <thead>
                <tr>
                  <th>Chat</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="user-row">
                    <td>
                      <button onClick={() => handleUserClick(user._id, user.username)}>
                        {user.username}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="chat-window">
            {selectedUserId ? (
              <>
                <div className="chat-header">{selectedConv}</div>
                <div className="messages">
                  {messages.length === 0 ? (
                    <p>No messages to display</p>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message._id}
                        className={`message ${message.senderId === userId ? 'from-you' : 'from-other'}`}
                      >
                        {message.message}
                      </div>
                    ))
                  )}
                  {/* Scroll to bottom marker */}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSubmit} className="message-form">
                  <input
                    type="text"
                    placeholder="Send a message"
                    value={sendmsg}
                    onChange={(e) => setSendmsg(e.target.value)}
                    className="message-input"
                  />
                  <button type="submit" className="send-button">Send</button>
                </form>
              </>
            ) : (
              <p>Select a user to start a chat</p>
            )}
          </div>
        </div>
      
  );
};

export default ChatApp;
