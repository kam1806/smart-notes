import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import QuizSection from '../components/QuizSection';
import './NoteDetail.css'; 

const NoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL;
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/notes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("NOTE DATA:", res.data); // <--- Check console to see real data name
        setNote(res.data);
      } catch (err) {
        console.error("Error fetching note:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id]);

  if (loading) return <div className="text-center mt-20 text-white">Loading Study Kit...</div>;
  if (!note) return <div className="text-center mt-20 text-white">Note not found.</div>;

  // 🔥 FIX: Check BOTH names so it never fails
  const quizData = note.quizzes || note.quiz_questions || [];

  return (
    <div className="note-detail-container">
      
      {/* HEADER */}
      <div className="detail-header">
        <button onClick={() => navigate('/home')} className="back-link">
          ← Back to Library
        </button>
        <h1>{note.title}</h1>
      </div>

      <div className="detail-grid">
        
        {/* LEFT COLUMN: Content */}
        <div className="left-content">
          
          {/* Summary */}
          <div className="content-box">
            <h2 className="section-label">📄 Summary</h2>
            <p className="text-content">{note.summary}</p>
          </div>

          {/* Key Points */}
          <div className="content-box">
            <h2 className="section-label">📌 Key Points</h2>
            <div className="text-content">
              {/* Handle bullet points safely */}
              {note.bullet_points && note.bullet_points.split('\n').map((point, i) => (
                <div key={i}>{point}</div>
              ))}
            </div>
          </div>

          {/* Quiz Section */}
          <div className="mt-12">
            <h2 className="section-label">🧠 Knowledge Check</h2>
            
            {/* USE THE FIXED VARIABLE 'quizData' HERE */}
            {quizData.length > 0 ? (
               <QuizSection quizzes={quizData} />
            ) : (
               <div className="content-box" style={{textAlign: 'center', color: '#aaa'}}>
                 No quiz questions were generated for this note.
                 <br/><small>(Debug: Received 0 items)</small>
               </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar info */}
        <div className="right-sidebar">
          <div className="sidebar-sticky">
            <div className="quiz-prompt-box">
              <h3>Ready to Test?</h3>
              <p style={{ margin: '15px 0', color: '#ddd' }}>
                Review the summary on the left, then scroll down to take the quiz!
              </p>
              <div style={{ fontSize: '3rem' }}>📝</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NoteDetail;