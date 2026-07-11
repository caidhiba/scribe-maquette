from datetime import datetime
from sqlalchemy.orm import Session
from app.models.meeting import Meeting, MeetingStatus
from app.core.exceptions import not_found, forbidden
from app.services.consent_service import assert_all_consented

def get_owned(db: Session, meeting_id: str, user_id: str) -> Meeting:
    m = db.get(Meeting, meeting_id)
    if not m: raise not_found("Réunion introuvable")
    if m.owner_id != user_id: raise forbidden()
    return m

def start(db: Session, meeting: Meeting) -> Meeting:
    assert_all_consented(db, meeting)
    meeting.status = MeetingStatus.active
    meeting.started_at = meeting.started_at or datetime.utcnow()
    db.commit(); db.refresh(meeting)
    return meeting

def end(db: Session, meeting: Meeting) -> Meeting:
    meeting.status = MeetingStatus.ended
    meeting.ended_at = datetime.utcnow()
    db.commit(); db.refresh(meeting)
    return meeting
