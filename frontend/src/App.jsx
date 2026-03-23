import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import CreateNote from './components/CreateNote';
import QuizPage from './components/QuizPage';
import NoteDetail from './components/NoteDetail';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/create" element={<CreateNote />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/notes/:id" element={<NoteDetail />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;