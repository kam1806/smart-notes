from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from services.database import Base

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    # Added title and proper ForeignKey
    title = Column(String(255), nullable=False) 
    user_id = Column(Integer, ForeignKey("users.id"), index=True) 
    original_text = Column(Text, nullable=False)
    
    # AI-Generated Content
    summary = Column(Text, nullable=True)
    bullet_points = Column(Text, nullable=True) 
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="notes")
    quizzes = relationship("QuizQuestion", back_populates="note", cascade="all, delete-orphan")
    
    
class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    note_id = Column(Integer, ForeignKey("notes.id")) 
    
    question_text = Column(Text, nullable=False)
    correct_answer = Column(String, nullable=False)
    # Options for MCQs
    distractor_1 = Column(String, nullable=True)
    distractor_2 = Column(String, nullable=True)
    distractor_3 = Column(String, nullable=True)
    # Allows this to function as a Flashcard too
    is_flashcard = Column(Boolean, default=False)

    note = relationship("Note", back_populates="quizzes")
    