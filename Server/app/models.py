from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr
    password: str

class LoginModel(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: EmailStr
    role: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class OTPModel(BaseModel):
    email: EmailStr
    otp: str
    expires_at: datetime

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str
    purpose: str = "registration"



class StudentCreate(BaseModel):
    name: str
    roll_number: str
    class_name: Optional[str] = None
    grade: Optional[str] = None

class StudentOut(StudentCreate):
    id: str = Field(..., alias="_id")
