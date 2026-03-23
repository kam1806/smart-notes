import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' or 'library'
  const navigate = useNavigate();

  // Fetch notes on load (so they are ready when you click the button)
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8000/notes', { 
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotes(res.data);
      } catch (err) {
        console.error("Error loading library:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  return (
    <div className="home-container">
      
      {/* --- MODE 1: THE DASHBOARD (Start Screen) --- */}
      {viewMode === 'dashboard' && (
        <div className="dashboard-wrapper">
          <div className="welcome-text">
            <h1>Welcome Back! 🚀</h1>
            <p>What would you like to do today?</p>
          </div>

          <div className="action-cards-container">
            {/* CARD 1: CREATE */}
            <div className="action-card create-card" onClick={() => navigate('/create')}>
              <div className="icon">✨</div>
              <h2>Create New Kit</h2>
              <p>Paste notes and let AI generate summaries & quizzes.</p>
            </div>

            {/* CARD 2: VIEW SAVED (The button you wanted) */}
            <div className="action-card library-card" onClick={() => setViewMode('library')}>
              <div className="icon">📚</div>
              <h2>View Saved Notes</h2>
              <p>Access your personal library of study materials.</p>
              <div className="badge">{notes.length} Notes</div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODE 2: THE LIBRARY GRID (Hidden until clicked) --- */}
      {viewMode === 'library' && (
        <div className="library-section animate-slide-up">
          
          {/* Header with Back Button */}
          <div className="library-header">
            <button className="back-btn" onClick={() => setViewMode('dashboard')}>
              ← Back to Dashboard
            </button>
            <h2>📂 My Saved Notes</h2>
          </div>

          {loading && <div className="loading-spinner">Loading library...</div>}

          {!loading && notes.length === 0 && (
            <div className="empty-state">
              <p>No saved notes found.</p>
              <button onClick={() => navigate('/create')} className="text-link">Create your first one now!</button>
            </div>
          )}

          <div className="notes-grid">
            {notes.map((note) => (
              <div 
                key={note.id} 
                onClick={() => navigate(`/notes/${note.id}`)} 
                className="note-card"
              >
                <div className="card-top-strip"></div>
                <div className="card-content">
                  <h3>{note.title}</h3>
                  <p className="preview-text">
                    {note.summary ? note.summary.substring(0, 100) + "..." : "No summary available."}
                  </p>
                  <div className="card-footer">
                    <span className="open-btn">Open Kit →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;