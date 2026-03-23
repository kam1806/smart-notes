from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
import database, models
import security  # <--- Import your config from here

# Define the scheme (points to your login endpoint)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    """
    Dependency that extracts the user from the JWT token.
    Used to protect routes (like saving/reading notes).
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # 1. Decode the token using the settings from security.py
        payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        
        # 2. Extract the username
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # 3. Fetch the user from the database
    user = db.query(models.User).filter(models.User.username == username).first()
    
    if user is None:
        raise credentials_exception
        
    return user