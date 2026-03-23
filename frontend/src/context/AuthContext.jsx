import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Create the Context
const AuthContext = createContext();

// 2. EXPORT the Provider (This is what index.js is looking for!)
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));

    const login = (newToken) => {
        setToken(newToken);
        localStorage.setItem('token', newToken);
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Keep your hook export at the bottom
export const useAuth = () => useContext(AuthContext);