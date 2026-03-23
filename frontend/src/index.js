// frontend/src/index.js (The correct, final version)
import React from 'react';
import { AuthProvider } from './context/AuthContext.jsx';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // <-- CRITICAL: Import your main application component
import './index.css'; 
import { BrowserRouter } from 'react-router-dom';

// Find the root element in index.html
const rootElement = document.getElementById('root'); 

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        {/* Wrap App with the Router */}
        <BrowserRouter> 
          <AuthProvider>
            <App />
          </AuthProvider> 
        </BrowserRouter>
      </React.StrictMode>
    );
}