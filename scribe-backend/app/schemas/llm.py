from pydantic import BaseModel
from app.models.llm_artifact import ArtifactKind

class LLMArtifactIn(BaseModel):
    kind: ArtifactKind
    payload: dict

class LLMArtifactOut(LLMArtifactIn):
    id: str
    meeting_id: str
    class Config: from_attributes = True

class LLMStartOut(BaseModel):
    meeting_id: str
    ingest_url: str      # URL/token que le service LLM utilise pour renvoyer les artefacts
    stream_token: str    # token que le service LLM utilise pour poster audio/texte
