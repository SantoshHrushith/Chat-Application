import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { Link } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io("http://localhost:5001");

const Home = () => {
  const [messages, setMessages] = useState([]);
  const { id } = useParams(); // Receiver ID from URL parameters
  const [userId, setUserId] = useState('');
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

  // Fetch messages between sender and receiver when userId or id changes
  const fetchMessages = async () => {
    try {
      if (userId && id) {
        const res = await axios.get(`http://localhost:5001/message/${id}?senderId=${userId}`);
        setMessages(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      alert("Failed to fetch messages.");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [userId, id]);

  // Listen for new messages from the server
  useEffect(() => {
    socket.on("newMessage", (newMessage) => {
      // Check if the message belongs to the current conversation
      if (
        (newMessage.senderId === userId && newMessage.receiverId === id) ||
        (newMessage.senderId === id && newMessage.receiverId === userId)
      ) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    return () => {
      socket.off("newMessage"); // Clean up the event listener on unmount
    };
  }, [userId, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sendmsg.trim()) return;

    try {
      const res = await axios.post(`http://localhost:5001/message/send/${id}`, {
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
    <div>
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
      <Link to='/chatapp'>chajj</Link>
    </div>
  );
};

export default Home;
