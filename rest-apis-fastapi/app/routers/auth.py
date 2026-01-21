import os
from datetime import datetime, timedelta
from typing import Annotated, Optional
from fastapi import Depends, HTTPException, APIRouter, status, Response, Request
from fastapi.security import  OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from starlette import status
from jose import jwt, JWTError
from passlib.context import CryptContext
from ..database import SessionLocal
from ..utils import authenticate_user, create_access_token, create_refresh_token, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_MINUTES, get_current_user
from ..models import Users
from ..schemas import CreateUserRequest, Token



router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_user(create_user_request: CreateUserRequest, db: db_dependency):
    create_user_model = Users(
        username=create_user_request.username,
        hashed_password=bcrypt_context.hash(create_user_request.password)
    )
    db.add(create_user_model)
    db.commit()
    db.refresh(create_user_model)
    return create_user_model


@router.post("/token", response_model=Token)
async def login_for_access_token(
    response: Response,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: db_dependency
):
    user = authenticate_user(form_data.username, form_data.password, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(user.username, user.id, timedelta(minutes=int(ACCESS_TOKEN_EXPIRE_MINUTES)))
    refresh_token = create_refresh_token(user.username, user.id, timedelta(minutes=int(REFRESH_TOKEN_EXPIRE_MINUTES)))
    
    response.set_cookie(
        key="refresh_token", 
        value=refresh_token, 
        httponly=True, 
        secure=True, 
        samesite="lax"
    )

    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/refresh", response_model=Token)
async def refresh_token(request: Request, response: Response, db: db_dependency):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing")

    try:

        SECRET_KEY = os.getenv("SECRET_KEY")
        ALGORITHM = os.getenv("ALGORITHM")
        
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("id")
        
        if username is None or user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        # Validate user exists
        user = db.query(Users).filter(Users.id == user_id).first()
        if user is None:
             raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
             
        # Rotate tokens
        new_access_token = create_access_token(user.username, user.id, timedelta(minutes=int(ACCESS_TOKEN_EXPIRE_MINUTES)))
        new_refresh_token = create_refresh_token(user.username, user.id, timedelta(minutes=int(REFRESH_TOKEN_EXPIRE_MINUTES)))
        
        response.set_cookie(
            key="refresh_token", 
            value=new_refresh_token, 
            httponly=True, 
            secure=True, 
            samesite="lax"
        )
        
        return {"access_token": new_access_token, "token_type": "bearer"}

    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}
