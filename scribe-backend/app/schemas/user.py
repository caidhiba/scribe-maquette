from pydantic import BaseModel, EmailStr

class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str | None = None
    class Config: from_attributes = True
