import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleUser = async (e) => {
        e.preventDefault();

        // Basic validation
        if (password !== confirmPassword) {
            return alert('Passwords do not match');
        }

        if (!username || !email || !password || !confirmPassword) {
            return alert('All fields are required');
        }

        const data = {
            username,
            email,
            password,
        };

        try {
            await axios.post('http://localhost:5001/user/register', data);
            alert('Registration successful');
            navigate('/login');
        } catch (error) {
            if (error.response) {
                if (error.response.status === 400) {
                    alert('Please fill all required fields');
                } else if (error.response.status === 401) {
                    alert('Username already taken');
                } else {
                    alert('An error occurred');
                }
            } else {
                console.error(error);
                alert('Failed to connect to the server');
            }
        }
    };

    return (
        <div>
            <form onSubmit={handleUser}>
                <div>
                    <label>Username</label>
                    <input
                        type='text'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Email</label>
                    <input
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                
                <div>
                    <label>Password</label>
                    <input
                        type='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Confirm Password</label>
                    <input
                        type='password'
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <div className='buttons'>
                    <button className='save' type='submit'>Save</button>
                </div>
            </form>
        </div>
    );
};

export default Signup;
