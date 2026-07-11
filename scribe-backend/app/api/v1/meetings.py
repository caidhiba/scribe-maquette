from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.meeting import MeetingCreate, MeetingOut
from app.services import meeting_service
from app.models.meeting import Meeting

router = APIRouter()

@router.get("", response_model=list[MeetingOut])
def list_meetings(db: Session = Depends(get_db), user = Depends(get_current_user)):
    return db.query(Meeting).filter_by(owner_id=user.id).order_by(Meeting.created_at.desc()).all()

@router.post("", response_model=MeetingOut)
def create_meeting(data: MeetingCreate, db: Session = Depends(get_db), user = Depends(get_current_user)):
    m = Meeting(owner_id=user.id, title=data.title, mode=data.mode)
    db.add(m); db.commit(); db.refresh(m)
    return m

@router.get("/{meeting_id}", response_model=MeetingOut)
def get_meeting(meeting_id: str, db: Session = Depends(get_db), user = Depends(get_current_user)):
    return meeting_service.get_owned(db, meeting_id, user.id)

@router.post("/{meeting_id}/start", response_model=MeetingOut)
def start_meeting(meeting_id: str, db: Session = Depends(get_db), user = Depends(get_current_user)):
    m = meeting_service.get_owned(db, meeting_id, user.id)
    return meeting_service.start(db, m)

@router.post("/{meeting_id}/end", response_model=MeetingOut)
def end_meeting(meeting_id: str, db: Session = Depends(get_db), user = Depends(get_current_user)):
    m = meeting_service.get_owned(db, meeting_id, user.id)
    return meeting_service.end(db, m)
