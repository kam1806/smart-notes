from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

# --- 1. SHARED BASE MODELS ---

class QuizQuestionBase(BaseModel):
    question_text: str
    correct_answer: str
    distractor_1: Optional[str] = None
    distractor_2: Optional[str] = None
    distractor_3: Optional[str] = None
    is_flashcard: bool = False

    class Config:
        from_attributes = True

# --- 2. INPUT SCHEMAS (Front -> Back) ---

class NoteCreate(BaseModel):
    """Input for /generate endpoint"""
    title: str
    text: str

class NoteCreateResponse(BaseModel):
    """Output for /generate endpoint"""
    title: str
    summary: str
    bullet_points: str
    quizzes: List[QuizQuestionBase]

class QuizQuestionSave(QuizQuestionBase):
    pass

class NoteSave(BaseModel):
    """Input for /save endpoint"""
    title: str
    original_text: str
    summary: str
    bullet_points: str
    quizzes: List[QuizQuestionSave] = []

# --- 3. OUTPUT SCHEMAS (Back -> Front) ---

class QuizQuestionResponse(QuizQuestionBase):
    id: int
    note_id: int
    
    class Config:
        from_attributes = True

class Note(BaseModel):
    """Output schema for reading a Note"""
    id: int
    user_id: int  # <--- ADDED: Shows ownership
    title: str
    original_text: str
    summary: str
    bullet_points: str
    created_at: Optional[datetime] = None
    
    # Includes the questions in the response
    quizzes: List[QuizQuestionResponse] = [] 

    class Config:
        from_attributes = True