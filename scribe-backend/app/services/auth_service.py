from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token
from app.core.exceptions import bad_request, unauthorized

def register(db: Session, email: str, password: str, full_name: str | None) -> User:
    if db.query(User).filter_by(email=email).first():
        raise bad_request("Email déjà utilisé")
    user = User(email=email, full_name=full_name, password_hash=hash_password(password))
    db.add(user); db.commit(); db.refresh(user)
    return user

def login(db: Session, email: str, password: str) -> str:
    user = db.query(User).filter_by(email=email).first()
    if not user or not user.password_hash or not verify_password(password, user.password_hash):
        raise unauthorized("Identifiants invalides")
    return create_access_token(sub=user.id, extra={"email": user.email})

def upsert_google_user(db: Session, google_sub: str, email: str, full_name: str | None) -> User:
    user = db.query(User).filter_by(google_sub=google_sub).first() \
        or db.query(User).filter_by(email=email).first()
    if not user:
        user = User(email=email, full_name=full_name, google_sub=google_sub)
        db.add(user)
    else:
        user.google_sub = google_sub
        if not user.full_name: user.full_name = full_name
    db.commit(); db.refresh(user)
    return user
