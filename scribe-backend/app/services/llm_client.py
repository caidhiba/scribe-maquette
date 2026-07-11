"""Client HTTP vers le service LLM de ton collaborateur.
Ce backend ne fait AUCUN traitement LLM — il ne fait qu'orchestrer."""
import httpx
from app.config import settings

class LLMClient:
    def __init__(self):
        self._client = httpx.AsyncClient(
            base_url=settings.LLM_BASE_URL,
            headers={"Authorization": f"Bearer {settings.LLM_API_KEY}"},
            timeout=30.0,
        )

    async def open_session(self, meeting_id: str, callback_url: str) -> dict:
        """Demande au service LLM d'ouvrir une session de transcription.
        Retourne { stream_token, ingest_url } que le frontend utilisera."""
        r = await self._client.post("/sessions", json={
            "meeting_id": meeting_id,
            "callback_url": callback_url,
        })
        r.raise_for_status()
        return r.json()

    async def close_session(self, meeting_id: str) -> None:
        r = await self._client.post(f"/sessions/{meeting_id}/close")
        r.raise_for_status()

    async def close(self):
        await self._client.aclose()

llm_client = LLMClient()
