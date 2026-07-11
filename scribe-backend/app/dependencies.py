from fastapi import Depends, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import decode_token
from app.core.exceptions import unauthorized
from app.models.user import User

def get_current_user(
    authorization: str | None = Header(None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise unauthorized()
    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_token(token)
    except ValueError:
        raise unauthorized()
    user = db.get(User, payload["sub"])
    if not user:
        raise unauthorized()
    return user
