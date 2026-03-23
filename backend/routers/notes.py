from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
import models, schemas
from database import get_db
import oauth2
from services.groq import generate_summary_and_bullets, generate_quizzes_and_flashcards

router = APIRouter(
    prefix="/notes",
    tags=["notes"]
)

# --- 1. GENERATE (AI Preview) ---
@router.post("/generate", response_model=schemas.NoteCreateResponse)
async def generate_note(note_data: schemas.NoteCreate):
    # 1. Generate Summary & Bullets
    summary_data = await generate_summary_and_bullets(note_data.text)
    
    # 2. Generate Quiz Questions
    quiz_questions = await generate_quizzes_and_flashcards(note_data.text)
    
    return {
        "title": note_data.title,
        "summary": summary_data.get("summary", "No summary generated."),
        "bullet_points": summary_data.get("bullet_points", ""),
        "quizzes": quiz_questions
    }

# --- 2. SAVE (Commit to DB) ---
@router.post("/save")
async def save_note(
    note: schemas.NoteSave, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user) # <--- Use Real User
):
    try:
        # Save the Note content linked to the CURRENT USER
        db_note = models.Note(
            title=note.title,
            user_id=current_user.id, # <--- FIXED: Dynamic ID
            original_text=note.original_text,
            summary=note.summary,
            bullet_points=note.bullet_points
        )
        db.add(db_note)
        db.commit()
        db.refresh(db_note)

        # Save the Quizzes (if any exist)
        if note.quizzes:
            print(f"Saving {len(note.quizzes)} questions for Note {db_note.id}...")
            for q in note.quizzes:
                db_quiz = models.QuizQuestion(
                    note_id=db_note.id,
                    question_text=q.question_text,
                    correct_answer=q.correct_answer,
                    distractor_1=q.distractor_1,
                    distractor_2=q.distractor_2,
                    distractor_3=q.distractor_3,
                    is_flashcard=q.is_flashcard
                )
                db.add(db_quiz)
            db.commit()
        
        return {"message": "Saved successfully", "id": db_note.id}

    except Exception as e:
        db.rollback()
        print(f"Save Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- 3. GET ALL NOTES (For Library) ---
# This was missing in your file!
@router.get("/", response_model=List[schemas.Note])
def read_notes(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    # Only fetch notes that belong to the logged-in user
    notes = db.query(models.Note)\
        .filter(models.Note.user_id == current_user.id)\
        .order_by(models.Note.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
        
    return notes

# --- 4. GET SINGLE NOTE (For Study View) ---
@router.get("/{note_id}", response_model=schemas.Note)
def read_note(
    note_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    # Fetch note + quizzes, but ONLY if it belongs to the user
    note = db.query(models.Note)\
        .options(joinedload(models.Note.quizzes))\
        .filter(models.Note.id == note_id, models.Note.user_id == current_user.id)\
        .first()

    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    
    return note