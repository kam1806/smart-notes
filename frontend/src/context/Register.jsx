import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/register', {
                username: username,
                password: password
            });
            alert("Account created! Please login.");
            navigate('/login');
        } catch (err) {
            setError('Registration failed. Username may be taken.');
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                
                <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--baby-blue)' }}>
                    NEW USER
                </h2>

                {error && (
                    <div style={{ 
                        background: 'rgba(239, 68, 68, 0.2)', 
                        color: '#fca5a5', 
                        padding: '10px', 
                        borderRadius: '8px',
                        marginBottom: '15px'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input 
                        type="text" 
                        placeholder="Choose Username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        className="glass-input"
                    />
                    <input 
                        type="password" 
                        placeholder="Choose Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="glass-input"
                    />
                    
                    <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                        INITIALIZE ACCOUNT
                    </button>
                </form>

                <div style={{ marginTop: '20px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                    Already have access?{' '}
                    <Link to="/login" style={{ color: 'var(--baby-blue)', fontWeight: 'bold', textDecoration: 'none' }}>
                        Login Here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;