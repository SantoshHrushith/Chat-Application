import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Chat = () => {
    const [users, setUsers] = useState([]);
    const [userId, setUserId] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserId(decodedToken.id);
            } catch (error) {
                console.error('Invalid token:', error);
            }
        }
    }, []);

    const fetchUsers =async() => {
        try {
            const res = await axios.get(`http://localhost:5001/user/users/${userId}`);
            setUsers(res.data);
        }
        catch (error) {
            console.error(error);
            alert('Failed to fetch users.');
        }
    };

    useEffect(() => {
        if (userId) {
            fetchUsers();
        }
    }, [userId]);


    return (
        <div>
            <table className='w-full border-separate border-spacing-2'>
          <thead>
            <tr>
              <th className='border border-slate-600 rounded-md'>No</th>
              <th className='border border-slate-600 rounded-md'>chat</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user._id} className='h-8'>
                <td className='border border-slate-700 text-center'>{index + 1}</td>
                <td className='border border-slate-700 text-center'><Link to ={`/chat/${user._id}`}>{user.username}</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
    )
}

export default Chat