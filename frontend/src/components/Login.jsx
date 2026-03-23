import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const API_URL = process.env.REACT_APP_API_URL;

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // UPDATED URL: Changed from /token to /login
            const response = await axios.post(`${API_URL}/login`, 
                new URLSearchParams({
                    'username': username,
                    'password': password
                })
            );
            localStorage.setItem('token', response.data.access_token);
            navigate('/home');
        } catch (err) {
            console.error("Login failed", err);
            setError('Invalid credentials');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--baby-blue)' }}>SYSTEM LOGIN</h2>
                {error && <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>{error}</div>}
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="glass-input" />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="glass-input" />
                    <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>ENTER SYSTEM</button>
                </form>
                <div style={{ marginTop: '20px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                    New student? <Link to="/register" style={{ color: 'var(--baby-blue)', fontWeight: 'bold', textDecoration: 'none' }}>Create Account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;