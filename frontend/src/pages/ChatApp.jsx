import React, { useEffect, useState } from 'react';
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

  const handleUserClick = (userId) => {
    setSelectedUserId(userId); // Set the selected user ID for the chat
    setMessages([]); // Clear messages when a new user is selected
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
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Users List on the Left */}
      <div style={{ width: '30%', borderRight: '1px solid #ccc', padding: '10px' }}>
        <table className='w-full border-separate border-spacing-2'>
          <thead>
            <tr>
              <th className='border border-slate-600 rounded-md'>No</th>
              <th className='border border-slate-600 rounded-md'>Chat</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user._id} className='h-8'>
                <td className='border border-slate-700 text-center'>{index + 1}</td>
                <td className='border border-slate-700 text-center'>
                  <button onClick={() => handleUserClick(user._id)}>
                    {user.username}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chat Window on the Right */}
      <div style={{ width: '70%', padding: '10px' }}>
        {selectedUserId ? (
          <>
            <div>Chat Window</div>
            <div>
              {messages.length === 0 ? (
                <p>No messages to display</p>
              ) : (
                messages.map((message) => (
                  <div key={message._id}>
                    <strong>{message.senderId === userId ? 'You' : 'Other'}:</strong> {message.message}
                  </div>
                ))
              )}
            </div>
            <div>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Send a message"
                  value={sendmsg}
                  onChange={(e) => setSendmsg(e.target.value)}
                />
                <button type="submit">Send</button>
              </form>
            </div>
          </>
        ) : (
          <p>Select a user to start a chat</p>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
