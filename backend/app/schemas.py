from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional

class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  # admin/student

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class EventIn(BaseModel):
    title: str
    description: str
    start_datetime: datetime
    end_datetime: datetime
    location: str

class EventOut(BaseModel):
    id: int
    title: str
    description: str
    start_datetime: datetime
    end_datetime: datetime
    location: str
    ai_event_type: Optional[str] = None
    ai_keywords: Optional[str] = None
    ai_summary: Optional[str] = None

    class Config:
        from_attributes = True

class SlotIn(BaseModel):
    day: str
    start: str
    end: str

class ProfileIn(BaseModel):
    interests: List[str]
    availability: List[SlotIn]

class RecommendationOut(BaseModel):
    event: EventOut
    score: float
    why: str
