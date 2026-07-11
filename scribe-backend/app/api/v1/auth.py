from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth
from app.database import get_db
from app.config import settings
from app.schemas.auth import RegisterIn, LoginIn, TokenOut
from app.schemas.user import UserOut
from app.services import auth_service
from app.core.security import create_access_token
from app.dependencies import get_current_user

router = APIRouter()

oauth = OAuth()
if settings.GOOGLE_CLIENT_ID:
    oauth.register(
        name="google",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )

@router.post("/register", response_model=TokenOut)
def register(data: RegisterIn, db: Session = Depends(get_db)):
    user = auth_service.register(db, data.email, data.password, data.full_name)
    return TokenOut(access_token=create_access_token(sub=user.id, extra={"email": user.email}))

@router.post("/login", response_model=TokenOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    return TokenOut(access_token=auth_service.login(db, data.email, data.password))

@router.get("/me", response_model=UserOut)
def me(user = Depends(get_current_user)):
    return user

@router.get("/google/login")
async def google_login(request: Request):
    return await oauth.google.authorize_redirect(request, settings.GOOGLE_REDIRECT_URI)

@router.get("/google/callback", response_model=TokenOut)
async def google_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    info = token.get("userinfo") or await oauth.google.parse_id_token(request, token)
    user = auth_service.upsert_google_user(
        db, google_sub=info["sub"], email=info["email"], full_name=info.get("name"),
    )
    return TokenOut(access_token=create_access_token(sub=user.id, extra={"email": user.email}))
