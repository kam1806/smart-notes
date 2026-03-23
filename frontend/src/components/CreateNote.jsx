import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CreateNote.css';

const CreateNote = () => {
    const [title, setTitle] = useState('');
    const [originalText, setOriginalText] = useState('');
    const [result, setResult] = useState(null); 
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    // 1. Generate Content (Same as before)
    const handleGenerate = async () => {
        if (!title || !originalText) return;
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/notes/generate', {
                title: title,
                text: originalText
            });
            setResult(response.data);
        } catch (err) {
            console.error(err);
            alert("Failed to generate.");
        }
        setLoading(false);
    };
    // 2. Button Option A: Save Summary Only
    const handleSaveSummaryOnly = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8000/notes/save', 
                {
                    title: title,
                    original_text: originalText,
                    summary: result.summary,
                    bullet_points: result.bullet_points,
                    quizzes: [] // <--- SEND EMPTY LIST (Don't save quizzes)
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Summary saved to library! (Quiz discarded)");
            navigate('/home'); 
        } catch (err) {
            console.error("Save Error:", err);
            alert("Failed to save note.");
        }
    };
    // 3. Button Option B: Go to Quiz Page (Pass data, don't save yet)
    const handleGoToQuiz = () => {
        navigate('/quiz', { 
            state: { 
                // We pass EVERYTHING so the Quiz Page can save it later
                title: title, 
                originalText: originalText,
                summary: result.summary,
                bullet_points: result.bullet_points,
                quizzes: result.quizzes 
            } 
        });
    };
    // 4. Button Option C: Discard
    const handleDiscard = () => {
        if (window.confirm("Discard everything?")) {
            setResult(null);
            setTitle('');
            setOriginalText('');
        }
    };
    return (
        <div className="create-note-container">
            {!result ? (
                /* --- INPUT STATE --- */
                <div className="input-section">
                    <h2>Create New Study Kit</h2>
                    <input 
                        type="text" placeholder="Title" value={title}
                        onChange={(e) => setTitle(e.target.value)} className="title-input"
                    />
                    <textarea 
                        placeholder="Paste notes here..." value={originalText}
                        onChange={(e) => setOriginalText(e.target.value)} className="note-textarea"
                    />
                    <button className="gen-btn" onClick={handleGenerate} disabled={loading}>
                        {loading ? "Processing..." : "Generate Preview"}
                    </button>
                </div>
            ) : (
                /* --- PREVIEW STATE --- */
                <div className="preview-section">
                    <h2>Preview: {title}</h2>
                    <div className="summary-content">
                        <h3>Summary</h3>
                        <p>{result.summary}</p>
                    </div>
                    <div className="summary-content">
                        <h3>Key Bullet Points</h3>
                        <div style={{ whiteSpace: 'pre-line' }}>{result.bullet_points}</div>
                    </div>
                    {/* --- THE 3 BUTTONS --- */}
                    <div className="button-group" style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
                        
                        {/* 1. Save Summary Only */}
                        <button className="btn-secondary" onClick={handleSaveSummaryOnly}>
                            💾 Save Summary Only
                        </button>

                        <button className="btn-primary" onClick={handleGoToQuiz}>
                            🧠 Take Quiz & Save All
                        </button>

                        <button className="btn-danger" onClick={handleDiscard}>
                            🗑️ Discard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateNote;