from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import models, schemas, database
import security  # <--- Using your existing security.py

router = APIRouter(
    tags=["Authentication"]
)

# -----------------------------------------------------------
# 1. Registration Endpoint
# -----------------------------------------------------------
@router.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # Check if user exists
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Use security.py for hashing
    hashed_pwd = security.get_password_hash(user.password)
    
    new_user = models.User(username=user.username, hashed_password=hashed_pwd)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# -----------------------------------------------------------
# 2. Login Endpoint
# -----------------------------------------------------------
@router.post("/login", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db)
):
    # 1. Find user
    user = db.query(models.User).filter(
        models.User.username == form_data.username
    ).first()

    # 2. Verify credentials (using security.py)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Create access token (using security.py)
    access_token = security.create_access_token(
        data={"sub": user.username}
    )

    # 4. Return token
    return {"access_token": access_token, "token_type": "bearer"}