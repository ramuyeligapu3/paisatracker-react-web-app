from fastapi import APIRouter, status,Depends,Request
from fastapi.responses import JSONResponse,ORJSONResponse
from backend.app.core.exceptions import AppException
from backend.app.core.security import *
import bcrypt
 
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def response(success: bool, data=None, message: str = ""):
    return {
        "success": success,
        "data": data,
        "message": message
    }