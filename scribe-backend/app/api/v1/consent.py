from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.services import meeting_service, consent_service
from app.schemas.participant import ConsentIn, ParticipantOut

router = APIRouter()

@router.post("/{meeting_id}/participants/{participant_id}/consent", response_model=ParticipantOut)
def set_consent(meeting_id: str, participant_id: str, data: ConsentIn,
                db: Session = Depends(get_db), user = Depends(get_current_user)):
    meeting_service.get_owned(db, meeting_id, user.id)  # vérifie propriété
    return consent_service.set_consent(db, meeting_id, participant_id, data.consent_given)
