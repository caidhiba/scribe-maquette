from datetime import datetime
from pydantic import BaseModel
from app.models.meeting import MeetingMode, MeetingStatus
from app.schemas.participant import ParticipantOut

class MeetingCreate(BaseModel):
    title: str
    mode: MeetingMode

class MeetingOut(BaseModel):
    id: str
    title: str
    mode: MeetingMode
    status: MeetingStatus
    started_at: datetime | None = None
    ended_at: datetime | None = None
    participants: list[ParticipantOut] = []
    class Config: from_attributes = True
