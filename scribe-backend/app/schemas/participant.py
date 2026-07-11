from datetime import datetime
from pydantic import BaseModel, EmailStr

class ParticipantIn(BaseModel):
    display_name: str
    email: EmailStr | None = None

class ParticipantOut(BaseModel):
    id: str
    display_name: str
    email: EmailStr | None = None
    consent_given: bool
    consent_given_at: datetime | None = None
    class Config: from_attributes = True

class ConsentIn(BaseModel):
    consent_given: bool
