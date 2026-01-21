from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import SessionLocal
from app.models import Blog
from app.schemas import BlogCreate, BlogResponse
from app.utils import get_current_user

router = APIRouter(
    prefix="/blogs",
    tags=["blogs"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=BlogResponse)
async def create_blog(user: user_dependency, blog_request: BlogCreate, db: db_dependency):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication failed")
    
    slug = blog_request.title.lower().replace(" ", "-")
    # Simple check to ensure unique slug, though for a real app we might want more robust handling
    existing_blog = db.query(Blog).filter(Blog.slug == slug).first()
    if existing_blog:
        slug = f"{slug}-{datetime.now().timestamp()}"

    blog_model = Blog(
        **blog_request.dict(),
        slug=slug,
        created_at=datetime.utcnow().isoformat(),
        owner_id=user.get('id')
    )
    
    db.add(blog_model)
    db.commit()
    db.refresh(blog_model)
    return blog_model

@router.get("/", status_code=status.HTTP_200_OK, response_model=List[BlogResponse])
async def read_all_blogs(db: db_dependency):
    return db.query(Blog).filter(Blog.published == True).all()

@router.get("/{blog_id}", status_code=status.HTTP_200_OK, response_model=BlogResponse)
async def read_blog(blog_id: int, db: db_dependency):
    blog_model = db.query(Blog).filter(Blog.id == blog_id).first()
    if blog_model is None:
        raise HTTPException(status_code=404, detail='Blog not found')
    return blog_model

@router.delete("/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blog(user: user_dependency, blog_id: int, db: db_dependency):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication failed")
    
    blog_model = db.query(Blog).filter(Blog.id == blog_id).first()
    if blog_model is None:
        raise HTTPException(status_code=404, detail='Blog not found')
    
    if blog_model.owner_id != user.get('id'):
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this blog")

    db.query(Blog).filter(Blog.id == blog_id).delete()
    db.commit()
