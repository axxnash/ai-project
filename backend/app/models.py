from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Time, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(120), nullable=False)
    email = Column(String(200), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)  # admin | student

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    start_datetime = Column(DateTime, nullable=False)
    end_datetime = Column(DateTime, nullable=False)
    location = Column(String(200), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Gemini outputs (AI API proof)
    ai_event_type = Column(String(80), nullable=True)
    ai_keywords = Column(Text, nullable=True)      # comma-separated
    ai_summary = Column(Text, nullable=True)       # 1 line
    embedding_json = Column(Text, nullable=True)   # JSON list of floats

class StudentProfile(Base):
    __tablename__ = "student_profiles"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    interests = Column(Text, nullable=False)  # comma-separated

class AvailabilitySlot(Base):
    __tablename__ = "availability_slots"
    id = Column(Integer, primary_key=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    day_of_week = Column(String(3), nullable=False)  # Mon Tue Wed Thu Fri Sat Sun
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    __table_args__ = (
        UniqueConstraint("profile_id", "day_of_week", "start_time", "end_time", name="uniq_slot"),
    )

class SavedEvent(Base):
    __tablename__ = "saved_events"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
