from sqlalchemy.orm import Session
from app.models.participant import Participant
from app.models.meeting import Meeting
from app.core.exceptions import bad_request, not_found

def set_consent(db: Session, meeting_id: str, participant_id: str, consent: bool) -> Participant:
    p = db.query(Participant).filter_by(id=participant_id, meeting_id=meeting_id).first()
    if not p: raise not_found("Participant introuvable")
    from datetime import datetime
    p.consent_given = consent
    p.consent_given_at = datetime.utcnow() if consent else None
    db.commit(); db.refresh(p)
    return p

def assert_all_consented(db: Session, meeting: Meeting) -> None:
    if not meeting.participants:
        raise bad_request("Aucun participant enregistré.")
    missing = [p.display_name for p in meeting.participants if not p.consent_given]
    if missing:
        raise bad_request(f"Consentement manquant : {', '.join(missing)}")
