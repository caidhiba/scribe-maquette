from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.services import meeting_service
from app.schemas.participant import ParticipantIn, ParticipantOut
from app.models.participant import Participant

router = APIRouter()

@router.get("/{meeting_id}/participants", response_model=list[ParticipantOut])
def list_participants(meeting_id: str, db: Session = Depends(get_db), user = Depends(get_current_user)):
    m = meeting_service.get_owned(db, meeting_id, user.id)
    return m.participants

@router.post("/{meeting_id}/participants", response_model=ParticipantOut)
def add_participant(meeting_id: str, data: ParticipantIn,
                    db: Session = Depends(get_db), user = Depends(get_current_user)):
    m = meeting_service.get_owned(db, meeting_id, user.id)
    p = Participant(meeting_id=m.id, display_name=data.display_name, email=data.email)
    db.add(p); db.commit(); db.refresh(p)
    return p

@router.delete("/{meeting_id}/participants/{participant_id}", status_code=204)
def remove_participant(meeting_id: str, participant_id: str,
                       db: Session = Depends(get_db), user = Depends(get_current_user)):
    m = meeting_service.get_owned(db, meeting_id, user.id)
    p = next((x for x in m.participants if x.id == participant_id), None)
    if p:
        db.delete(p); db.commit()
