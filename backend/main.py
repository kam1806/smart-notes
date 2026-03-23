from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, notes
import models
from services.database import engine
# Ensure you import your new notes router

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- CORS SETTINGS ---
# This is the "Passport Control" for your app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://smart-notes-beta.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROUTES ---
app.include_router(auth.router)
app.include_router(notes.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Notes API"}