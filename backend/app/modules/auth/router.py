from backend.app.common.utils import *
from backend.app.core.config import settings
from .schemas import UserCreate, UserLogin, ForgotPasswordRequest, ResetPasswordRequest
from .service import AuthService
from .repository import UserRepository

auth_router = APIRouter()

def get_auth_service():
    return AuthService(UserRepository())

@auth_router.post("/signup")
async def signup(user: UserCreate, service: AuthService = Depends(get_auth_service)):
    res= await service.register(user)
    print(res,'(((((((((((((((((((((((((((((((signup)))))))))))))))))))))))))))))))')

    return ORJSONResponse(
        status_code=200,
        content=response(True,None, "User created successfull")
    )

   
@auth_router.post("/login")
async def login(credentials: UserLogin, service: AuthService = Depends(get_auth_service)):
    user = await service.authenticate(credentials)
    res=ORJSONResponse(status_code=200, content=response(True, {"userId":user.get("userId"),"accessToken":user.get("accessToken")}, "Login Successful"))
    # Use secure=False when frontend is localhost so cookie is sent over HTTP
    is_local = "localhost" in settings.FRONTEND_URL or "127.0.0.1" in settings.FRONTEND_URL
    res.set_cookie(
            key="refreshToken",
            value=user["refreshToken"],
            httponly=True,
            secure=not is_local,
            samesite="Lax",
            max_age=60 * 60 * 24 * 7,  # 7 days
        )
    return res

@auth_router.post("/refresh")
async def refresh_token(request: Request):
    refresh_token = request.cookies.get("refreshToken")
    if not refresh_token:
        raise AppException(message="Refresh token missing", status_code=401)
    payload = verify_token(refresh_token)
    user_id = payload.get("sub")
    if not user_id:
        raise AppException(message="Invalid token", status_code=401)
    new_access_token = create_access_token(data={"sub": user_id})
    return ORJSONResponse(
        status_code=200,
        content=response(True, {"accessToken": new_access_token}, "Token refreshed")
    )


@auth_router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest, service: AuthService = Depends(get_auth_service)):
    await service.forgot_password(body.email)
    return ORJSONResponse(
        status_code=200,
        content=response(True, message="If an account exists with this email, you will receive a reset link.")
    )


@auth_router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, service: AuthService = Depends(get_auth_service)):
    await service.reset_password(body.token, body.new_password)
    return ORJSONResponse(
        status_code=200,
        content=response(True, message="Password has been reset. You can sign in with your new password.")
    )

    