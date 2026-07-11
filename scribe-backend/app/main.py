from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.config import settings
from app.api.v1.router import api_router

app = FastAPI(title="Scribe API", version="1.0.0")

app.add_middleware(SessionMiddleware, secret_key=settings.JWT_SECRET)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_PREFIX)

@app.get("/health")
def health(): return {"status": "ok"}
