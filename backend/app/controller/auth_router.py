from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from app.models.models import *

import bcrypt

auth_router = APIRouter()



class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Startup

# Utils
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def response(success: bool, data=None, message: str = ""):
    return {
        "success": success,
        "data": data,
        "message": message
    }

# Signup
@auth_router.post("/signup")
async def create_user(user: UserCreate):
    existing_user = await UserModel.find_one(UserModel.email == user.email)
    if existing_user:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=response(False, None, "Email already registered")
        )
    
    hashed_password = hash_password(user.password)
    new_user = UserModel(email=user.email, password_hash=hashed_password)
    await new_user.insert()

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content=response(True, {"email": new_user.email}, "User created successfully")
    )

# Login
@auth_router.post("/login")
async def login(user: UserLogin):
    db_user = await UserModel.find_one(UserModel.email == user.email)
    if not db_user or not verify_password(user.password, db_user.password_hash):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content=response(False, None, "Invalid credentials")
        )
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content=response(True, {"email": db_user.email,"userId":str(db_user.id)}, "Login successful")
    )

# Forgot Password
@auth_router.post("/forgot-password")
async def reset_password(user: UserLogin):
    db_user = await UserModel.find_one(UserModel.email == user.email)
    if not db_user:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=response(False, None, "Email not found")
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content=response(True, None, "Password reset instructions sent")
    )
