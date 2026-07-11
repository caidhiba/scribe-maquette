import uuid
from datetime import datetime
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    full_name: Mapped[str | None] = mapped_column(String, nullable=True)
    password_hash: Mapped[str | None] = mapped_column(String, nullable=True)  # null si Google
    google_sub: Mapped[str | None] = mapped_column(String, unique=True, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    meetings: Mapped[list["Meeting"]] = relationship(back_populates="owner")
