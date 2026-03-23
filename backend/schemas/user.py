from pydantic import BaseModel
from typing import Optional

# =======================
# 1. TOKEN SCHEMAS
# =======================

class Token(BaseModel):
    """Schema for the response body when logging in"""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Schema for the data inside the JWT token (payload)"""
    username: Optional[str] = None


# =======================
# 2. USER SCHEMAS
# =======================

class UserBase(BaseModel):
    """Shared properties for User"""
    username: str

class UserCreate(UserBase):
    """Input properties for Registration (Password is required)"""
    password: str

class User(UserBase):
    """Output properties for User (Password is HIDDEN)"""
    id: int
    
    class Config:
        # Allows Pydantic to read data from SQLAlchemy (ORM) models
        from_attributes = True