import uuid, enum
from datetime import datetime
from sqlalchemy import String, DateTime, Enum, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class ArtifactKind(str, enum.Enum):
    transcript = "transcript"
    summary = "summary"
    theme = "theme"
    action_item = "action_item"

class LLMArtifact(Base):
    """Objets produits par le service LLM externe et rattachés à une réunion."""
    __tablename__ = "llm_artifacts"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id: Mapped[str] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"))
    kind: Mapped[ArtifactKind] = mapped_column(Enum(ArtifactKind), nullable=False)
    payload: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    meeting: Mapped["Meeting"] = relationship(back_populates="artifacts")
