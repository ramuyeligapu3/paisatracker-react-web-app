from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    currency: Optional[str] = None
    email_digest: Optional[bool] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str