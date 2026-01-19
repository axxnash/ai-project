import json
from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import time as dtime

from ics import Calendar, Event as ICSEvent

from app.db import Base, engine, get_db
from app import models
from app.schemas import RegisterIn, LoginIn, TokenOut, EventIn, EventOut, ProfileIn, RecommendationOut
from app.security import hash_pw, verify_pw, create_token, get_current_user, require_admin
from app.gemini_service import extract_event_fields, embed_text
from app.recommender import cosine, build_why, load_vec

app = FastAPI(title="UPM Event Recommender API (FastAPI + MySQL + Gemini)")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5176", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create tables locally (fast MVP)
Base.metadata.create_all(bind=engine)

# ---------- AUTH ----------
@app.post("/auth/register")
def register(data: RegisterIn, db: Session = Depends(get_db)):
    if data.role not in ["admin", "student"]:
        raise HTTPException(400, "role must be admin or student")

    exists = db.query(models.User).filter(models.User.email == data.email).first()
    if exists:
        raise HTTPException(400, "Email already registered")

    user = models.User(
        name=data.name,
        email=data.email,
        password_hash=hash_pw(data.password),
        role=data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "email": user.email, "role": user.role}

@app.post("/auth/login", response_model=TokenOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not verify_pw(data.password, user.password_hash):
        raise HTTPException(401, "Invalid email/password")
    return TokenOut(access_token=create_token(user.id, user.role))

# ---------- EVENTS (ADMIN CRUD + GEMINI) ----------
@app.post("/events", response_model=EventOut)
def create_event(data: EventIn, db: Session = Depends(get_db), admin=Depends(require_admin)):
    if data.end_datetime <= data.start_datetime:
        raise HTTPException(400, "end_datetime must be after start_datetime")

    ev = models.Event(
        title=data.title,
        description=data.description,
        start_datetime=data.start_datetime,
        end_datetime=data.end_datetime,
        location=data.location,
        created_by=admin.id,
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)

    # Gemini: structured extraction + embedding
    extracted = extract_event_fields(ev.title, ev.description)
    keywords = extracted["keywords"]
    summary = extracted["summary"]
    event_type = extracted["event_type"]

    embed_input = f"{ev.title}\n{summary}\nKeywords: {', '.join(keywords)}"
    vec = embed_text(embed_input)

    ev.ai_event_type = event_type
    ev.ai_keywords = ",".join(keywords)
    ev.ai_summary = summary
    ev.embedding_json = json.dumps(vec)

    db.commit()
    db.refresh(ev)
    return ev

@app.get("/events", response_model=list[EventOut])
def list_events(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(models.Event).order_by(models.Event.start_datetime.asc()).all()

@app.put("/events/{event_id}", response_model=EventOut)
def update_event(event_id: int, data: EventIn, db: Session = Depends(get_db), admin=Depends(require_admin)):
    ev = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not ev:
        raise HTTPException(404, "Event not found")

    ev.title = data.title
    ev.description = data.description
    ev.start_datetime = data.start_datetime
    ev.end_datetime = data.end_datetime
    ev.location = data.location

    extracted = extract_event_fields(ev.title, ev.description)
    keywords = extracted["keywords"]
    summary = extracted["summary"]
    event_type = extracted["event_type"]

    embed_input = f"{ev.title}\n{summary}\nKeywords: {', '.join(keywords)}"
    vec = embed_text(embed_input)

    ev.ai_event_type = event_type
    ev.ai_keywords = ",".join(keywords)
    ev.ai_summary = summary
    ev.embedding_json = json.dumps(vec)

    db.commit()
    db.refresh(ev)
    return ev

@app.delete("/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    ev = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not ev:
        raise HTTPException(404, "Event not found")
    db.delete(ev)
    db.commit()
    return {"deleted": True}

# ---------- PROFILE ----------
@app.post("/profile")
def upsert_profile(data: ProfileIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user.role != "student":
        raise HTTPException(403, "Students only")

    interests = [x.strip() for x in data.interests if x.strip()]
    if not interests:
        raise HTTPException(400, "At least 1 interest required")

    prof = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == user.id).first()
    interests_csv = ",".join(interests)

    if not prof:
        prof = models.StudentProfile(user_id=user.id, interests=interests_csv)
        db.add(prof)
        db.commit()
        db.refresh(prof)
    else:
        prof.interests = interests_csv
        db.query(models.AvailabilitySlot).filter(models.AvailabilitySlot.profile_id == prof.id).delete()
        db.commit()

    for s in data.availability:
        day = s.day.strip()[:3].title()
        sh, sm = map(int, s.start.split(":"))
        eh, em = map(int, s.end.split(":"))
        if (eh, em) <= (sh, sm):
            raise HTTPException(400, f"Invalid slot: {day} {s.start}-{s.end}")

        db.add(models.AvailabilitySlot(
            profile_id=prof.id,
            day_of_week=day,
            start_time=dtime(sh, sm),
            end_time=dtime(eh, em),
        ))

    db.commit()
    return {"ok": True}

@app.get("/profile")
def get_profile(db: Session = Depends(get_db), user=Depends(get_current_user)):
    prof = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == user.id).first()
    if not prof:
        return {"exists": False}
    slots = db.query(models.AvailabilitySlot).filter(models.AvailabilitySlot.profile_id == prof.id).all()
    return {
        "exists": True,
        "interests": [x.strip() for x in prof.interests.split(",") if x.strip()],
        "availability": [{"day": s.day_of_week, "start": str(s.start_time)[:5], "end": str(s.end_time)[:5]} for s in slots]
    }

# ---------- RECOMMENDATIONS (CONFLICT FILTER + GEMINI EMBEDDINGS RANKING) ----------
@app.get("/recommendations", response_model=list[RecommendationOut])
def recommend(db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user.role != "student":
        raise HTTPException(403, "Students only")

    prof = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == user.id).first()
    if not prof:
        raise HTTPException(400, "Create profile first")

    interests = [x.strip() for x in prof.interests.split(",") if x.strip()]
    slots = db.query(models.AvailabilitySlot).filter(models.AvailabilitySlot.profile_id == prof.id).all()
    events = db.query(models.Event).order_by(models.Event.start_datetime.asc()).all()

    # 1) conflict filter
    allowed = []
    for ev in events:
        day = ev.start_datetime.strftime("%a")  # Mon Tue...
        ev_start = ev.start_datetime.time()
        ev_end = ev.end_datetime.time()
        ok = any((s.day_of_week == day and s.start_time <= ev_start and ev_end <= s.end_time) for s in slots)
        if ok:
            allowed.append(ev)

    if not allowed:
        return []

    # 2) student embedding (Gemini)
    student_text = " ".join(interests)
    student_vec = embed_text(student_text)

    # 3) score by cosine similarity
    scored = []
    for ev in allowed:
        ev_vec = load_vec(ev.embedding_json)
        if not ev_vec:
            continue
        score = float(cosine(student_vec, ev_vec))
        scored.append((ev, score))

    scored.sort(key=lambda x: x[1], reverse=True)

    # 4) response with explainable why
    out = []
    for ev, score in scored[:10]:
        out.append({
            "event": ev,
            "score": score,
            "why": build_why(interests, ev.ai_keywords or "")
        })
    return out

@app.get("/")
def root():
    return {"message": "UPM Event Recommender API running"}


# ---------- SAVE + ICS EXPORT ----------
@app.post("/saved/{event_id}")
def save_event(event_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    ev = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not ev:
        raise HTTPException(404, "Event not found")

    db.add(models.SavedEvent(user_id=user.id, event_id=event_id))
    db.commit()
    return {"saved": True}

@app.get("/saved")
def list_saved(db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = db.query(models.SavedEvent).filter(models.SavedEvent.user_id == user.id).all()
    return {"saved_event_ids": [r.event_id for r in rows]}

@app.delete("/saved/{event_id}")
def unsave_event(event_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    saved = db.query(models.SavedEvent).filter(
        models.SavedEvent.user_id == user.id,
        models.SavedEvent.event_id == event_id
    ).first()
    if not saved:
        raise HTTPException(404, "Saved event not found")
    db.delete(saved)
    db.commit()
    return {"unsaved": True}

@app.get("/health")
def health():
    return {"status": "ok"}
