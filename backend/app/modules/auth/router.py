from backend.app.common.utils import *
from .schemas import UserCreate, UserLogin
from .service import AuthService
from .repository import UserRepository

auth_router = APIRouter()

def get_auth_service():
    return AuthService(UserRepository())

@auth_router.post("/signup")
async def signup(user: UserCreate, service: AuthService = Depends(get_auth_service)):
    return await service.register(user)
   
@auth_router.post("/login")
async def login(credentials: UserLogin, service: AuthService = Depends(get_auth_service)):
    user = await service.authenticate(credentials)
    res=ORJSONResponse(status_code=200, content=response(True, user, "Login Successful"))
    res.set_cookie(
            key="refreshToken",
            value=user["refreshToken"],
            httponly=True,
            secure=True,
            samesite="Strict",
            max_age=60*60*24*7,  # 7 days
        )
    return res

@auth_router.post("/refresh")
async def refresh_token(request: Request):
    refresh_token = request.cookies.get("refreshToken")

    print("((((((((((((((((((((refresh_token))))))))))))))))))))",refresh_token)

    if not refresh_token:
        raise AppException(message="Refresh token missing",status_code=401,)
    payload = verify_token(refresh_token)  # ✅ Validate refresh token
    user_id = payload.get("sub")

    if not user_id:
        raise AppException(message="Invalid token",status_code=401)

    new_access_token = create_access_token(
        data={"sub": user_id},
        expires_delta=timedelta(minutes=30)
    )
    print("((((((((((((((((((((((new_access_token))))))))))))))))))))))",new_access_token)

    return ORJSONResponse(
        status_code=200,
        content=response(True, {"accessToken": new_access_token}, "Token refreshed")
    )



