"""Pont entre le frontend et le service LLM du collaborateur.

- POST /llm/meetings/{id}/session : démarre la session LLM (après consentement).
- POST /llm/meetings/{id}/session/close : ferme la session.
- POST /llm/ingest/{id} : webhook appelé par le service LLM pour pousser
  des artefacts (transcript partiel, résumé, thèmes, actions...).
- GET /llm/meetings/{id}/artifacts : lecture par le frontend."""
from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.services import meeting_service
from app.services.llm_client import llm_client
from app.services.consent_service import assert_all_consented
from app.schemas.llm import LLMStartOut, LLMArtifactIn, LLMArtifactOut
from app.models.llm_artifact import LLMArtifact
from app.config import settings
from app.core.exceptions import unauthorized

router = APIRouter()

@router.post("/meetings/{meeting_id}/session", response_model=LLMStartOut)
async def open_llm_session(meeting_id: str, request: Request,
                           db: Session = Depends(get_db), user = Depends(get_current_user)):
    m = meeting_service.get_owned(db, meeting_id, user.id)
    assert_all_consented(db, m)
    callback = str(request.url_for("llm_ingest", meeting_id=m.id))
    session = await llm_client.open_session(m.id, callback)
    return LLMStartOut(
        meeting_id=m.id,
        ingest_url=session["ingest_url"],
        stream_token=session["stream_token"],
    )

@router.post("/meetings/{meeting_id}/session/close")
async def close_llm_session(meeting_id: str, db: Session = Depends(get_db), user = Depends(get_current_user)):
    m = meeting_service.get_owned(db, meeting_id, user.id)
    await llm_client.close_session(m.id)
    return {"ok": True}

@router.post("/ingest/{meeting_id}", name="llm_ingest", response_model=LLMArtifactOut)
def ingest_artifact(meeting_id: str, data: LLMArtifactIn,
                    x_llm_secret: str | None = Header(None),
                    db: Session = Depends(get_db)):
    if x_llm_secret != settings.LLM_WEBHOOK_SECRET:
        raise unauthorized("Signature LLM invalide")
    art = LLMArtifact(meeting_id=meeting_id, kind=data.kind, payload=data.payload)
    db.add(art); db.commit(); db.refresh(art)
    return art

@router.get("/meetings/{meeting_id}/artifacts", response_model=list[LLMArtifactOut])
def list_artifacts(meeting_id: str, db: Session = Depends(get_db), user = Depends(get_current_user)):
    m = meeting_service.get_owned(db, meeting_id, user.id)
    return m.artifacts
