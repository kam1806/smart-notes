import React from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import QuizSection from './QuizSection';
import './QuizPage.css'; // <--- Connects the new CSS styles

const QuizPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 1. Get ALL data passed from CreateNote
  const { title, originalText, summary, bullet_points, quizzes } = location.state || {};

  // Safety Check
  if (!quizzes) {
    return (
      <div className="quiz-page-container" style={{ textAlign: 'center', color: 'white' }}>
        <h2 className="quiz-actions-title">No Data Found</h2>
        <button onClick={() => navigate('/create')} className="quiz-btn primary">
          Go Back
        </button>
      </div>
    );
  }

  // 2. Logic to Save Everything (Note + Quiz)
  const handleSaveFullKit = async () => {
    try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:8000/notes/save', 
            {
                title: title,
                original_text: originalText,
                summary: summary,
                bullet_points: bullet_points,
                quizzes: quizzes // <--- SENDING THE QUIZZES
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Success! Full Study Kit (Summary + Quiz) saved.");
        navigate('/home'); 
    } catch (err) {
        console.error("Save Error:", err);
        alert("Failed to save the study kit.");
    }
  };

  // 3. Logic to Save Only Summary (Discard Quiz)
  const handleSaveSummaryOnly = async () => {
    try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:8000/notes/save', 
            {
                title: title,
                original_text: originalText,
                summary: summary,
                bullet_points: bullet_points,
                quizzes: [] // <--- Empty list = Save only text
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Summary saved (Quiz discarded).");
        navigate('/home'); 
    } catch (err) {
        console.error("Save Error:", err);
        alert("Failed to save.");
    }
  };

  return (
    <div className="quiz-page-container">
      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'white', margin: 0 }}>🧠 Quiz: {title}</h1>
      </div>

      {/* Render the Quiz Cards */}
      <QuizSection quizzes={quizzes} />

      {/* --- ACTION BUTTONS PANEL --- */}
      <div className="quiz-actions-panel">
        <h3 className="quiz-actions-title">Done Studying?</h3>
        
        <div className="action-buttons-row">
            
            {/* 1. Main Action: Save Everything */}
            <button 
                onClick={handleSaveFullKit}
                className="quiz-btn primary"
            >
                💾 Save Note & Quiz Results
            </button>

            {/* 2. Secondary Action: Save only summary */}
            <button 
                onClick={handleSaveSummaryOnly}
                className="quiz-btn secondary"
            >
                Save Summary Only
            </button>
            
            {/* 3. Discard */}
            <button 
                onClick={() => navigate('/home')}
                className="quiz-btn danger"
            >
                Discard All
            </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;