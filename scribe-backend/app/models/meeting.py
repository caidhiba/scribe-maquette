import uuid, enum
from datetime import datetime
from sqlalchemy import String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class MeetingMode(str, enum.Enum):
    visio = "visio"
    presentiel = "presentiel"

class MeetingStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    ended = "ended"

class Meeting(Base):
    __tablename__ = "meetings"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String, nullable=False)
    mode: Mapped[MeetingMode] = mapped_column(Enum(MeetingMode), nullable=False)
    status: Mapped[MeetingStatus] = mapped_column(Enum(MeetingStatus), default=MeetingStatus.draft)
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    owner: Mapped["User"] = relationship(back_populates="meetings")
    participants: Mapped[list["Participant"]] = relationship(
        back_populates="meeting", cascade="all, delete-orphan"
    )
    artifacts: Mapped[list["LLMArtifact"]] = relationship(
        back_populates="meeting", cascade="all, delete-orphan"
    )
