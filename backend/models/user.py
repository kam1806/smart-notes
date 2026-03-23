# backend/models/user.py
from sqlalchemy import Column, Integer, String
from database import Base 
from sqlalchemy.orm import relationship
 # Assuming database.py is one level up

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    notes = relationship("Note", back_populates="owner")

    # You will link notes to this user later
    # notes = relationship("Note", back_populates="owner")