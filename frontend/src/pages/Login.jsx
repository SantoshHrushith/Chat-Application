import React, { useState } from 'react'
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const [username,setUsername]=useState('');
    const [password,setPassword]=useState('');
    const navigate=useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5001/user/login', { username, password });
            const { token} = res.data;
            localStorage.setItem('token', token);
            alert('Login Successful');
            navigate('/')

        } catch (err) {
            console.error(err);
            alert('Invalid credentials');
        }
    };
  return (
    <div>
            <form onSubmit={handleLogin}>
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
                    <label>Password</label>
                    <input
                        type='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className='buttons'>
                    <button  type='submit'>Login</button>
                </div>
            </form>
            <Link to='/register'>register</Link>
        </div>
  )
}

export default Login