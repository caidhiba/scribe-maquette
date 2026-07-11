from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.schemas.user import UserOut

router = APIRouter()

@router.get("/me", response_model=UserOut)
def read_me(user = Depends(get_current_user)):
    return user
