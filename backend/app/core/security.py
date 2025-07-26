from jose import jwt
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError, ExpiredSignatureError
from .exceptions import AppException

SECRET_KEY = "f4d8aab3a6f8a66d21b2c845a4ec93fef924cbe87e4f1eaf0d5fa9f7e4bcf4d6"  # Use env var in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 5
REFRESH_TOKEN_EXPIRE_DAYS = 30

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

    print('((((((((((((((((((((((expire))))))))))))))))))))))',expire)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict):
    expire = datetime.utcnow() + timedelta(minutes=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("(((((((((((((((((((((((((((((((((((payload)))))))))))))))))))))))))))))))))))",payload)
        return payload
    except ExpiredSignatureError:
        raise AppException(message="Token has expired", status_code=401)
    except JWTError:
        raise AppException(message="Invalid token", status_code=401)


from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = verify_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise AppException (message="Invalid credentials",status_code=401,)
    return user_id