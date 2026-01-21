from pydantic import BaseModel


class CreateUserRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class BlogBase(BaseModel):
    title: str
    content: str
    published: bool = False

class BlogCreate(BlogBase):
    pass

class BlogResponse(BlogBase):
    id: int
    slug: str
    created_at: str
    owner_id: int

    class Config:
        orm_mode = True
