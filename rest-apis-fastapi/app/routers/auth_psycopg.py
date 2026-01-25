"""
Authentication router using psycopg2-binary directly instead of SQLAlchemy
This is an alternative implementation to routers/auth.py
"""
import os
from datetime import datetime, timedelta
from typing import Annotated, Optional
from fastapi import Depends, HTTPException, APIRouter, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt, JWTError
from passlib.context import CryptContext
import psycopg2
from psycopg2.extras import RealDictCursor

from ..database_psycopg import create_connection
from ..schemas import CreateUserRequest, Token

router = APIRouter(
    prefix="/auth-psycopg",
    tags=["auth-psycopg"]
)

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Load environment variables
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_MINUTES = int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES", "10080"))

def create_access_token(username: str, user_id: int, expires_delta: timedelta):
    encode = {"sub": username, "id": user_id}
    expires = datetime.utcnow() + expires_delta
    encode.update({"exp": expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(username: str, user_id: int, expires_delta: timedelta):
    encode = {"sub": username, "id": user_id}
    expires = datetime.utcnow() + expires_delta
    encode.update({"exp": expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)

def authenticate_user(username: str, password: str) -> Optional[dict]:
    """Authenticate user using raw SQL"""
    conn = create_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            "SELECT id, username, hashed_password FROM users WHERE username = %s",
            (username,)
        )
        user = cur.fetchone()
        cur.close()
        
        if not user:
            return None
        
        if not bcrypt_context.verify(password, user["hashed_password"]):
            return None
        
        return user
    finally:
        conn.close()

def get_current_user(request: Request) -> dict:
    """Extract and validate JWT token from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    
    token = auth_header.split(" ")[1]
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("id")
        
        if username is None or user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        return {"username": username, "id": user_id}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

user_dependency = Annotated[dict, Depends(get_current_user)]

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_user(create_user_request: CreateUserRequest):
    """Create a new user using raw SQL"""
    hashed_password = bcrypt_context.hash(create_user_request.password)
    
    conn = create_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            """
            INSERT INTO users (username, hashed_password)
            VALUES (%s, %s)
            RETURNING id, username
            """,
            (create_user_request.username, hashed_password)
        )
        user = cur.fetchone()
        conn.commit()
        cur.close()
        return user
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    finally:
        conn.close()

@router.post("/token", response_model=Token)
async def login_for_access_token(
    response: Response,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
):
    """Login and get access token"""
    user = authenticate_user(form_data.username, form_data.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        user["username"], 
        user["id"], 
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_refresh_token(
        user["username"], 
        user["id"], 
        timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    )
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax"
    )

    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/refresh", response_model=Token)
async def refresh_token(request: Request, response: Response):
    """Refresh access token using refresh token from cookie"""
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing"
        )

    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("id")
        
        if username is None or user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        # Validate user exists using raw SQL
        conn = create_connection()
        try:
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute(
                "SELECT id, username FROM users WHERE id = %s",
                (user_id,)
            )
            user = cur.fetchone()
            cur.close()
            
            if user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found"
                )
        finally:
            conn.close()
        
        # Rotate tokens
        new_access_token = create_access_token(
            username, 
            user_id, 
            timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        new_refresh_token = create_refresh_token(
            username, 
            user_id, 
            timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
        )
        
        response.set_cookie(
            key="refresh_token",
            value=new_refresh_token,
            httponly=True,
            secure=True,
            samesite="lax"
        )
        
        return {"access_token": new_access_token, "token_type": "bearer"}

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

@router.post("/logout")
async def logout(response: Response):
    """Logout by clearing refresh token cookie"""
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}
