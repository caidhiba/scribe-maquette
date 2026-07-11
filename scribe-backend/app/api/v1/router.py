from fastapi import APIRouter
from . import auth, users, meetings, participants, consent, llm_bridge

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(meetings.router, prefix="/meetings", tags=["meetings"])
api_router.include_router(participants.router, prefix="/meetings", tags=["participants"])
api_router.include_router(consent.router, prefix="/meetings", tags=["consent"])
api_router.include_router(llm_bridge.router, prefix="/llm", tags=["llm-bridge"])
