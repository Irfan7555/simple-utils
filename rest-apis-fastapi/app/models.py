from .database import Base
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey

class Users(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Blog(Base):
    __tablename__ = "blogs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(String)
    slug = Column(String, unique=True, index=True)
    published = Column(Boolean, default=False)
    created_at = Column(String)  # Storing as ISO string for simplicity
    owner_id = Column(Integer, ForeignKey("users.id"))
    